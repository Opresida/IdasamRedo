import { type Express, type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { insertEnrollmentSchema, insertCourseSchema, updateCourseSchema, insertContactSubmissionSchema, insertCourseNotificationSubscriptionSchema, insertArticleCategorySchema, insertArticleSchema, updateArticleSchema, insertArticleCommentSchema, insertEmailAudienceSchema, insertAudienceLeadSchema, insertEmailTemplateSchema, insertEmailCampaignSchema, insertCustomHtmlTemplateSchema, insertProposalSchema, insertSignatarioSchema, insertNewsletterSubscriberSchema, insertFinancialAccountSchema, insertFinancialCategorySchema, insertFinancialProjectSchema, insertFinancialTransactionSchema, assinaturaLogs as assinaturaLogsTable, PROPOSAL_STATUSES } from "@shared/schema";
import type { ProposalStatus, SignatureType } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import { createServer } from "http";
import crypto from "crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "IDASAM <onboarding@resend.dev>";

function wrapEmailHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px">
      <tr><td style="background:#1a5c38;padding:24px 32px">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold">IDASAM</p>
      </td></tr>
      <tr><td style="padding:32px;color:#333333;font-size:15px;line-height:1.6">
        ${body}
      </td></tr>
      <tr><td style="background:#f8f8f8;padding:16px 32px;text-align:center">
        <p style="margin:0;color:#999999;font-size:12px">Instituto de Desenvolvimento da Amazônia</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendEmailViaResend(to: string, subject: string, htmlBody: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email send");
    return false;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html: wrapEmailHtml(htmlBody),
    });
    return !result.error;
  } catch (e) {
    console.error("Error sending email via Resend:", e);
    return false;
  }
}

function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

async function markdownToHtml(md: string): Promise<string> {
  const { marked } = await import("marked");
  return marked.parse(md) as string;
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos PDF são permitidos"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const EDITOR_EMAIL = process.env.EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are not set. Admin login will be disabled. Set these in Replit Secrets to enable admin access.");
} else {
  console.log("Admin authentication configured via environment variables.");
}

const ADMIN_CREDENTIALS: Record<string, string> = {
  ...(ADMIN_EMAIL && ADMIN_PASSWORD ? { [ADMIN_EMAIL]: ADMIN_PASSWORD } : {}),
  ...(EDITOR_EMAIL && EDITOR_PASSWORD ? { [EDITOR_EMAIL]: EDITOR_PASSWORD } : {}),
};

const ADMIN_ROLES: Record<string, string> = {
  ...(ADMIN_EMAIL ? { [ADMIN_EMAIL]: "admin" } : {}),
  ...(EDITOR_EMAIL ? { [EDITOR_EMAIL]: "editor" } : {}),
};

async function createAdminSession(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const role = ADMIN_ROLES[email] ?? "admin";
  await storage.createAdminSession(token, email, role, expiresAt);
  return token;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }
  const token = authHeader.slice(7);
  storage.getAdminSession(token).then(async (session) => {
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await storage.deleteAdminSession(token);
      }
      return res.status(401).json({ message: "Sessão expirada ou inválida" });
    }
    next();
  }).catch(() => {
    return res.status(500).json({ message: "Erro ao verificar sessão" });
  });
}

const INITIAL_COURSES = [
  {
    title: "Aplicação de IA's em ambientes Industriais",
    description: "Fundamentos e aplicações práticas de Inteligência Artificial em contextos industriais, automação de processos e tomada de decisão baseada em dados.",
    instructor: "Prof. Mario Figueiredo e Prof. Alexandre Souza",
    workload: 20,
    startDate: "2026-03-02",
    endDate: "2026-03-06",
    location: "Manaus – AM (Presencial)",
    status: "completed" as const,
  },
  {
    title: "Transformação Digital",
    description: "Estratégias e ferramentas para a transformação digital de organizações: cultura, tecnologia, processos e modelos de negócios na era digital.",
    instructor: "Prof. Alexandre Souza",
    workload: 20,
    startDate: "2026-03-09",
    endDate: "2026-03-13",
    location: "Manaus – AM (Presencial)",
    status: "completed" as const,
  },
  {
    title: "Lean Manufacturing aplicada à Indústria 4.0",
    description: "Princípios do Lean Manufacturing integrados às tecnologias da Indústria 4.0: eliminação de desperdícios, eficiência operacional e digitalização de processos.",
    instructor: "Prof. Gilson Lira",
    workload: 20,
    startDate: "2026-03-16",
    endDate: "2026-03-18",
    location: "Manaus – AM (Presencial)",
    status: "completed" as const,
  },
  {
    title: "Inovação Tecnológica na Indústria",
    description: "Metodologias de inovação, desenvolvimento de novos produtos e serviços, gestão da propriedade intelectual e ecossistemas de inovação industrial.",
    instructor: "Profa. Fabiana Oliveira",
    workload: 20,
    startDate: "2026-03-19",
    endDate: "2026-03-20",
    location: "Manaus – AM (Presencial)",
    status: "completed" as const,
  },
  {
    title: "Processos avaliativos da maturidade da indústria 4.0",
    description: "Modelos e ferramentas para avaliar o nível de maturidade digital das organizações, diagnóstico estratégico e roteiro de implementação da Indústria 4.0.",
    instructor: "Prof. Alexandre Souza",
    workload: 20,
    startDate: "2026-03-23",
    endDate: "2026-03-27",
    location: "Manaus – AM (Presencial)",
    status: "open" as const,
  },
  {
    title: "Logística e Cadeia de Suprimentos",
    description: "Gestão integrada da cadeia de suprimentos, logística reversa, rastreabilidade, tecnologias emergentes e sustentabilidade na cadeia logística.",
    instructor: "Prof. Américo Minori",
    workload: 20,
    startDate: "2026-03-30",
    endDate: "2026-03-31",
    location: "Manaus – AM (Presencial)",
    status: "coming_soon" as const,
  },
];

async function seedCourses() {
  try {
    const existing = await storage.getCourses();
    if (existing.length === 0) {
      for (const course of INITIAL_COURSES) {
        await storage.createCourse(course);
      }
      console.log("Cursos iniciais inseridos com sucesso.");
    }
  } catch (err) {
    console.error("Erro ao popular cursos:", err);
  }
}

const INITIAL_ARTICLE_CATEGORIES = [
  { name: 'Bioeconomia', slug: 'bioeconomia', description: 'Projetos de bioeconomia e desenvolvimento sustentável' },
  { name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação e tecnologia verde' },
  { name: 'Educação', slug: 'educacao', description: 'Programas educacionais e capacitação' },
  { name: 'Sustentabilidade', slug: 'sustentabilidade', description: 'Iniciativas sustentáveis e meio ambiente' },
  { name: 'Pesquisa', slug: 'pesquisa', description: 'Projetos de pesquisa científica' },
];

const INITIAL_ARTICLES = [
  {
    title: 'IDASAM Lança Revolucionário Projeto de Bioeconomia Circular na Amazônia',
    excerpt: 'Iniciativa inovadora promove transformação de resíduos florestais em produtos de alto valor agregado, gerando renda sustentável para comunidades tradicionais.',
    content: `O Instituto de Desenvolvimento Sustentável da Amazônia (IDASAM) anunciou o lançamento de seu mais ambicioso projeto: a implementação de um sistema de bioeconomia circular que transformará resíduos florestais em produtos de alto valor agregado.

O projeto, desenvolvido em parceria com universidades nacionais e internacionais, utilizará tecnologias avançadas de biotecnologia para converter biomassa residual da floresta amazônica em bioprodutos como bioplásticos, cosméticos naturais e compostos farmacêuticos.

"Esta iniciativa representa um marco na nossa missão de conciliar conservação ambiental com desenvolvimento econômico", explicou a Dra. Maria Silva, diretora científica do IDASAM. "Estamos criando uma nova economia baseada na floresta em pé."

O projeto beneficiará diretamente mais de 500 famílias em 12 comunidades ribeirinhas, oferecendo capacitação técnica e oportunidades de trabalho sustentável.`,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2071&q=80',
    authorName: 'Dr. Maria Silva',
    categorySlug: 'bioeconomia',
    tags: ['bioeconomia', 'sustentabilidade', 'amazônia', 'comunidades'],
    published: 'true',
    featured: 'true',
    readingTime: 5,
  },
  {
    title: 'Tecnologia Verde: IDASAM Desenvolve Sistema de Monitoramento Florestal por IA',
    excerpt: 'Inovador sistema utiliza inteligência artificial e sensores IoT para detectar desmatamento e queimadas em tempo real.',
    content: `O IDASAM apresentou seu mais recente desenvolvimento tecnológico: um sistema integrado de monitoramento florestal que combina inteligência artificial, sensores IoT e imagens de satélite para detectar atividades de desmatamento em tempo real.

O sistema, batizado de "GuardianForest", utiliza algoritmos de machine learning treinados com mais de 10 anos de dados florestais para identificar padrões anômalos na cobertura vegetal com precisão superior a 95%.

"Nossa tecnologia pode identificar uma área desmatada de apenas 0,1 hectare em menos de 2 horas", explica o engenheiro João Santos, líder da equipe de desenvolvimento.

O GuardianForest já está sendo testado em uma área de 50.000 hectares na região de Tefé, com resultados promissores.`,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=2025&q=80',
    authorName: 'Eng. João Santos',
    categorySlug: 'tecnologia',
    tags: ['tecnologia', 'monitoramento', 'ia', 'floresta'],
    published: 'true',
    featured: 'false',
    readingTime: 4,
  },
  {
    title: 'Educação Transformadora: Programa de Capacitação Técnica Forma 150 Jovens',
    excerpt: 'Iniciativa do IDASAM capacita jovens amazônicos em tecnologias sustentáveis e empreendedorismo verde.',
    content: `O programa "Jovens Amazônicos do Futuro", desenvolvido pelo IDASAM, celebra a formatura de sua terceira turma, totalizando 150 jovens capacitados em tecnologias sustentáveis e empreendedorismo verde nos últimos 18 meses.

O programa oferece formação técnica em áreas como aquicultura sustentável, manejo florestal, energias renováveis e biotecnologia aplicada.

"Ver esses jovens desenvolvendo projetos inovadores e criando suas próprias empresas sustentáveis é extremamente gratificante", comenta Ana Costa, coordenadora do programa.

A taxa de empregabilidade dos egressos supera 85%.`,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2070&q=80',
    authorName: 'Ana Costa',
    categorySlug: 'educacao',
    tags: ['educação', 'jovens', 'capacitação', 'sustentabilidade'],
    published: 'true',
    featured: 'false',
    readingTime: 3,
  },
  {
    title: 'Parceria Internacional: IDASAM e Universidade de Oxford Desenvolvem Pesquisa Pioneira',
    excerpt: 'Colaboração científica resultará em banco de dados genético da biodiversidade amazônica.',
    content: `O IDASAM firmou parceria estratégica com a Universidade de Oxford para desenvolvimento de pesquisa pioneira sobre a biodiversidade amazônica. O projeto criará o maior banco de dados genético da flora e fauna amazônica já desenvolvido.

A pesquisa utilizará técnicas de sequenciamento genético de última geração para catalogar e preservar digitalmente o patrimônio genético de espécies amazônicas.

"Esta parceria representa uma oportunidade única de preservar o conhecimento genético da Amazônia para as futuras gerações", destaca o Dr. Carlos Mendes.`,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2070&q=80',
    authorName: 'Dr. Carlos Mendes',
    categorySlug: 'pesquisa',
    tags: ['pesquisa', 'biodiversidade', 'genética', 'parceria'],
    published: 'true',
    featured: 'false',
    readingTime: 6,
  },
  {
    title: 'Agricultura Regenerativa: Técnicas Ancestrais Aliadas à Ciência Moderna',
    excerpt: 'IDASAM resgata conhecimentos tradicionais e os combina com tecnologias modernas para revolucionar a agricultura amazônica.',
    content: `Um projeto inovador do IDASAM está resgatando técnicas ancestrais de agricultura indígena e combinando-as com tecnologias modernas para desenvolver um sistema de agricultura regenerativa.

O projeto "Terra Viva" trabalha diretamente com cinco etnias indígenas para documentar e aprimorar práticas agrícolas tradicionais que mantém a fertilidade do solo por décadas sem uso de agroquímicos.

Os resultados mostram aumento de 40% na produtividade e melhoria significativa na qualidade nutricional dos alimentos. Quinze comunidades já adotaram as técnicas.`,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=2025&q=80',
    authorName: 'Dra. Isabel Ribeiro',
    categorySlug: 'sustentabilidade',
    tags: ['agricultura', 'indígenas', 'regenerativa', 'tradicional'],
    published: 'true',
    featured: 'false',
    readingTime: 5,
  },
];

async function seedArticles() {
  try {
    const existingCats = await storage.getArticleCategories();
    if (existingCats.length === 0) {
      for (const cat of INITIAL_ARTICLE_CATEGORIES) {
        await storage.createArticleCategory(cat);
      }
      console.log("Categorias de artigos inseridas com sucesso.");
    }

    const existingArts = await storage.getArticles();
    if (existingArts.length === 0) {
      const cats = await storage.getArticleCategories();
      const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
      for (const art of INITIAL_ARTICLES) {
        const { categorySlug, ...rest } = art;
        await storage.createArticle({ ...rest, categoryId: catMap[categorySlug] || null });
      }
      console.log("Artigos iniciais inseridos com sucesso.");
    }
  } catch (err) {
    console.error("Erro ao popular artigos:", err);
  }
}

async function migrateEnrollmentNames() {
  try {
    const count = await storage.migrateEnrollmentNamesToTitleCase();
    if (count > 0) {
      console.log(`Migrated ${count} enrollment name(s) to Title Case.`);
    }
  } catch (err) {
    console.error("Erro ao migrar nomes dos alunos para Title Case:", err);
  }
}

async function deduplicateExistingEnrollments() {
  try {
    const count = await storage.deduplicateEnrollments();
    if (count > 0) {
      console.log(`Removed ${count} duplicate enrollment(s) on startup.`);
    }
  } catch (err) {
    console.error("Erro ao deduplicar inscrições:", err);
  }
}

export async function registerRoutes(app: Express) {
  await seedCourses();
  await seedArticles();
  await storage.backfillAuthCodes();
  await storage.deleteOrphanedCertificates();
  await migrateEnrollmentNames();
  await deduplicateExistingEnrollments();

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  const isSocialBot = (userAgent: string = ''): boolean => {
    const botPatterns = [
      'facebookexternalhit', 'facebookbot', 'twitterbot', 'linkedinbot',
      'whatsapp', 'telegrambot', 'slackbot', 'slack-imgproxy',
      'googlebot', 'bingbot', 'applebot', 'discordbot',
      'pinterest', 'redditbot', 'vkshare', 'w3c_validator',
      'rogerbot', 'embedly', 'quora link preview', 'showyoubot',
      'outbrain', 'flipboard', 'tumblr', 'bitlybot', 'skypeuripreview',
    ];
    const ua = userAgent.toLowerCase();
    return botPatterns.some(pattern => ua.includes(pattern));
  };

  const injectArticleOgTags = async (req: any, res: any, next: any, articleId: string) => {
    if (!isSocialBot(req.get('User-Agent'))) {
      return next();
    }
    try {
      const art = await storage.getArticle(articleId);
      if (!art) return next();
      const ogTitle = art.title.replace(/"/g, '&quot;');
      const ogDesc = (art.excerpt || art.content.substring(0, 160)).replace(/"/g, '&quot;');
      const ogImage = art.image || 'https://i.imgur.com/i74pvbH.jpeg';
      const ogUrl = `${req.protocol}://${req.get('host')}/noticias?artigo=${art.id}`;
      const { resolve } = await import('path');
      const htmlPath = resolve(process.cwd(), 'client/index.html');
      const { promises: fsp } = await import('fs');
      let html = await fsp.readFile(htmlPath, 'utf-8').catch(() => '');
      if (!html) return next();
      const ogTags = `
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="${ogImage}" />`;
      html = html.replace('</head>', `${ogTags}\n  </head>`);
      return res.set('Content-Type', 'text/html').send(html);
    } catch (e) {
      return next();
    }
  };

  app.get("/noticias", async (req, res, next) => {
    const artigo = req.query.artigo as string;
    if (!artigo) return next();
    return injectArticleOgTags(req, res, next, artigo);
  });

  app.get("/noticias/:id", async (req, res, next) => {
    const { id } = req.params;
    return injectArticleOgTags(req, res, next, id);
  });

  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
    }
    const validPassword = ADMIN_CREDENTIALS[email as string];
    if (!validPassword || validPassword !== password) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    try {
      const token = await createAdminSession(email);
      res.json({ token, email });
    } catch (err) {
      console.error("Erro ao criar sessão:", err);
      res.status(500).json({ message: "Erro interno ao criar sessão" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        await storage.deleteAdminSession(authHeader.slice(7));
      } catch (err) {
        console.error("Erro ao deletar sessão:", err);
      }
    }
    res.json({ message: "Sessão encerrada" });
  });

  app.get("/api/admin/verify", requireAdmin, (_req, res) => {
    res.json({ valid: true });
  });

  app.post("/api/admin/migrate-names", requireAdmin, async (_req, res) => {
    try {
      const count = await storage.migrateEnrollmentNamesToTitleCase();
      res.json({ message: `Migração concluída. ${count} nome(s) atualizado(s) para Title Case.`, updated: count });
    } catch (err) {
      res.status(500).json({ message: "Erro ao executar migração de nomes" });
    }
  });

  app.get("/api/courses", async (_req, res) => {
    try {
      const all = await storage.getCourses();
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar cursos" });
    }
  });

  app.get("/api/courses/verify", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string" || code.trim() === "") {
        return res.status(400).json({ message: "Código de autenticação é obrigatório" });
      }
      const course = await storage.getCourseByAuthCode(code.trim().toUpperCase());
      if (!course) {
        return res.status(404).json({ message: "Código não encontrado. Verifique se digitou corretamente." });
      }
      res.json({
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        workload: course.workload,
        startDate: course.startDate,
        endDate: course.endDate,
        location: course.location,
        authCode: course.authCode,
      });
    } catch (err) {
      res.status(500).json({ message: "Erro ao verificar código" });
    }
  });

  app.post("/api/courses", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const course = await storage.createCourse(parsed.data);
      res.status(201).json(course);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar curso" });
    }
  });

  app.put("/api/courses/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updateCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const updated = await storage.updateCourse(req.params.id, parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar curso" });
    }
  });

  app.get("/api/courses/:id/cert-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getCertConfig(req.params.id);
      if (!config) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      res.json(config);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar configuração de certificado" });
    }
  });

  app.post("/api/courses/:id/cert-config", requireAdmin, async (req, res) => {
    try {
      const { certTemplate, certBlockConfig } = req.body;
      if (!certTemplate || !certBlockConfig) {
        return res.status(400).json({ message: "certTemplate e certBlockConfig são obrigatórios" });
      }
      const updated = await storage.saveCertConfig(req.params.id, certTemplate, certBlockConfig);
      if (!updated) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      res.json({ message: "Configuração salva com sucesso" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao salvar configuração de certificado" });
    }
  });

  app.delete("/api/courses/:id", requireAdmin, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      await storage.deleteCourse(req.params.id);
      res.json({ message: "Curso excluído com sucesso" });
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("foreign key") || msg.includes("violates")) {
        return res.status(409).json({ message: "Não é possível excluir este curso pois possui registros vinculados." });
      }
      res.status(500).json({ message: "Erro ao excluir curso" });
    }
  });

  app.post("/api/enrollments", async (req, res) => {
    try {
      const parsed = insertEnrollmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const course = await storage.getCourse(parsed.data.courseId);
      if (!course) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const session = await storage.getAdminSession(token);
        if (session && new Date(session.expiresAt) > new Date()) {
          isAdmin = true;
        }
      }
      if (!isAdmin && course.status !== "open") {
        return res.status(403).json({ message: "Inscrições não estão abertas para este curso" });
      }
      const enrollment = await storage.createEnrollment(parsed.data);
      res.status(201).json(enrollment);

      // Automation: send course_signup email if template exists (Markdown and/or HTML)
      if (enrollment.email) {
        try {
          const vars: Record<string, string> = {
            nome: enrollment.fullName ?? enrollment.email,
            curso: course.title,
          };
          const mdTemplates = await storage.getEmailTemplatesByTrigger("course_signup");
          if (mdTemplates.length > 0) {
            const tpl = mdTemplates[0];
            const rendered = renderTemplate(tpl.body, vars);
            const html = await markdownToHtml(rendered);
            await sendEmailViaResend(enrollment.email, tpl.subject, html);
          }
          const htmlTemplates = await storage.getCustomHtmlTemplatesByTrigger("course_signup");
          if (htmlTemplates.length > 0) {
            const htmlTpl = htmlTemplates[0];
            const rendered = renderTemplate(htmlTpl.htmlContent, vars);
            const subject = htmlTpl.name;
            await sendEmailViaResend(enrollment.email, subject, rendered);
          }
        } catch (emailErr) {
          console.error("Error sending course_signup email:", emailErr);
        }
      }
    } catch (err: any) {
      if (err?.message === "DUPLICATE_ENROLLMENT") {
        return res.status(409).json({ message: "Aluno já está matriculado neste curso. Verifique CPF, e-mail ou nome." });
      }
      res.status(500).json({ message: "Erro ao criar inscrição" });
    }
  });

  app.get("/api/enrollments", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getEnrollments();
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar inscrições" });
    }
  });

  app.put("/api/enrollments/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertEnrollmentSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const updated = await storage.updateEnrollment(req.params.id, parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Inscrição não encontrada" });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar inscrição" });
    }
  });

  app.delete("/api/enrollments/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEnrollment(req.params.id);
      res.json({ message: "Inscrição excluída com sucesso" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir inscrição" });
    }
  });

  app.post("/api/enrollments/bulk", requireAdmin, async (req, res) => {
    try {
      const { courseId, records } = req.body;
      if (!courseId || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: "courseId e records são obrigatórios" });
      }
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      const created = [];
      const errors = [];
      let skipped = 0;
      const seenCpfs = new Set<string>();
      const seenEmails = new Set<string>();
      const seenNames = new Set<string>();
      for (let i = 0; i < records.length; i++) {
        const parsed = insertEnrollmentSchema.safeParse({ ...records[i], courseId });
        if (!parsed.success) {
          errors.push({ row: i + 1, errors: parsed.error.errors });
          continue;
        }
        const { cpf, email, fullName } = parsed.data;
        const normalizedCpf = cpf ? cpf.trim().replace(/\D/g, "") : null;
        const normalizedEmail = email ? email.trim().toLowerCase() : null;
        const normalizedName = fullName ? fullName.trim().toLowerCase().replace(/\s+/g, " ") : null;
        const hasCpf = !!(normalizedCpf && normalizedCpf.length > 0);
        const hasEmail = !!(normalizedEmail && normalizedEmail.length > 0);
        const dupInBatch = (hasCpf && seenCpfs.has(normalizedCpf!))
          || (hasEmail && seenEmails.has(normalizedEmail!))
          || (!hasCpf && !hasEmail && normalizedName && normalizedName.length > 0 && seenNames.has(normalizedName));
        if (dupInBatch) {
          skipped++;
          continue;
        }
        const dupInDb = await storage.findEnrollmentDuplicate(courseId, cpf, email, fullName);
        if (dupInDb) {
          skipped++;
          continue;
        }
        if (hasCpf) seenCpfs.add(normalizedCpf!);
        if (hasEmail) seenEmails.add(normalizedEmail!);
        if (!hasCpf && !hasEmail && normalizedName && normalizedName.length > 0) seenNames.add(normalizedName);
        try {
          const enrollment = await storage.createEnrollment(parsed.data);
          created.push(enrollment);
        } catch (e: any) {
          if (e?.message === "DUPLICATE_ENROLLMENT") {
            skipped++;
          } else {
            errors.push({ row: i + 1, errors: [{ message: "Erro ao inserir" }] });
          }
        }
      }
      res.status(201).json({ created: created.length, skipped, errors });
    } catch (err) {
      res.status(500).json({ message: "Erro ao importar inscrições" });
    }
  });

  app.get("/api/enrollments/course/:courseId", requireAdmin, async (req, res) => {
    try {
      const list = await storage.getEnrollmentsByCourse(req.params.courseId);
      const enrollmentIds = list.map((e) => e.id);
      const certs = await storage.getCertificatesByEnrollmentIds(enrollmentIds);
      const certSet = new Set(certs.filter((c) => !!c.fileData).map((c) => c.enrollmentId));
      const enriched = list.map((e) => ({
        ...e,
        hasCertificate: certSet.has(e.id),
      }));
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar inscrições do curso" });
    }
  });

  app.get("/api/certificates/lookup", async (req, res) => {
    try {
      const { identifier } = req.query;
      if (!identifier || typeof identifier !== "string" || identifier.trim() === "") {
        return res.status(400).json({ message: "CPF, e-mail ou nome completo é obrigatório" });
      }
      const enrolls = await storage.getEnrollmentByIdentifier(identifier.trim());
      if (enrolls.length === 0) {
        return res.status(404).json({ message: "Nenhuma inscrição encontrada" });
      }

      const rawResults = await Promise.all(
        enrolls.map(async (e) => {
          const cert = await storage.getCertificate(e.id);
          const course = await storage.getCourse(e.courseId);
          return {
            enrollmentId: e.id,
            fullName: e.fullName,
            courseId: e.courseId,
            courseTitle: course?.title ?? "Curso",
            hasCertificate: !!(cert?.fileData),
          };
        })
      );

      const deduped = new Map<string, typeof rawResults[number]>();
      for (const r of rawResults) {
        const existing = deduped.get(r.courseId);
        if (!existing || (!existing.hasCertificate && r.hasCertificate)) {
          deduped.set(r.courseId, r);
        }
      }

      const result = Array.from(deduped.values()).map(({ courseId: _cid, ...rest }) => rest);

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Erro ao consultar certificado" });
    }
  });

  app.get("/api/certificates/download/:enrollmentId", async (req, res) => {
    try {
      const { identifier } = req.query;
      if (!identifier || typeof identifier !== "string" || identifier.trim() === "") {
        return res.status(400).json({ message: "CPF, e-mail ou nome completo é obrigatório para baixar certificado" });
      }
      const enrollment = await storage.getEnrollmentByIdentifier(identifier.trim());
      const match = enrollment.find((e) => e.id === req.params.enrollmentId);
      if (!match) {
        return res.status(403).json({ message: "Não autorizado a baixar este certificado" });
      }
      const cert = await storage.getCertificate(req.params.enrollmentId);
      if (!cert || !cert.fileData) {
        return res.status(404).json({ message: "Certificado não encontrado" });
      }
      const buffer = Buffer.from(cert.fileData, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="certificado.pdf"');
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ message: "Erro ao baixar certificado" });
    }
  });

  app.post("/api/certificates/upload-base64/:enrollmentId", requireAdmin, async (req, res) => {
    try {
      const { fileData } = req.body;
      if (!fileData) {
        return res.status(400).json({ message: "fileData (base64) é obrigatório" });
      }
      const allEnrollments = await storage.getEnrollments();
      const exists = allEnrollments.some((e) => e.id === req.params.enrollmentId);
      if (!exists) {
        return res.status(404).json({ message: "Inscrição não encontrada" });
      }
      const cert = await storage.updateCertificate(req.params.enrollmentId, fileData);
      res.status(201).json({ id: cert.id, enrollmentId: cert.enrollmentId, uploadedAt: cert.uploadedAt });
    } catch (err) {
      res.status(500).json({ message: "Erro ao fazer upload do certificado" });
    }
  });

  app.post("/api/certificates/upload/:enrollmentId", requireAdmin, (req, res, next) => {
    upload.single("certificate")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "Arquivo excede o tamanho máximo de 10MB" });
        }
        return res.status(400).json({ message: `Erro no upload: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Arquivo PDF é obrigatório" });
      }
      const enrollments = await storage.getEnrollments();
      const exists = enrollments.some((e) => e.id === req.params.enrollmentId);
      if (!exists) {
        return res.status(404).json({ message: "Inscrição não encontrada" });
      }
      const fileData = req.file.buffer.toString("base64");
      const cert = await storage.updateCertificate(req.params.enrollmentId, fileData);
      res.status(201).json({ id: cert.id, enrollmentId: cert.enrollmentId, uploadedAt: cert.uploadedAt });
    } catch (err) {
      res.status(500).json({ message: "Erro ao fazer upload do certificado" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const submission = await storage.createContactSubmission(parsed.data);
      res.status(201).json(submission);
    } catch (err) {
      res.status(500).json({ message: "Erro ao enviar proposta" });
    }
  });

  app.get("/api/contact", requireAdmin, async (_req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar propostas" });
    }
  });

  app.post("/api/course-notifications", async (req, res) => {
    try {
      const parsed = insertCourseNotificationSubscriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const sub = await storage.createCourseNotificationSubscription(parsed.data);
      res.status(201).json(sub);
    } catch (err) {
      res.status(500).json({ message: "Erro ao registrar notificação" });
    }
  });

  app.get("/api/course-notifications", requireAdmin, async (_req, res) => {
    try {
      const subs = await storage.getCourseNotificationSubscriptions();
      res.json(subs);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar inscrições de notificação" });
    }
  });

  app.get("/api/article-categories", async (_req, res) => {
    try {
      const cats = await storage.getArticleCategories();
      res.json(cats);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post("/api/article-categories", requireAdmin, async (req, res) => {
    try {
      const parsed = insertArticleCategorySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const cat = await storage.createArticleCategory(parsed.data);
      res.status(201).json(cat);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  app.put("/api/article-categories/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertArticleCategorySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const cat = await storage.updateArticleCategory(req.params.id, parsed.data);
      if (!cat) return res.status(404).json({ message: "Categoria não encontrada" });
      res.json(cat);
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });

  app.delete("/api/article-categories/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteArticleCategory(req.params.id);
      res.json({ message: "Categoria excluída com sucesso" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const session = await storage.getAdminSession(token);
        if (session && new Date(session.expiresAt) > new Date()) {
          isAdmin = true;
        }
      }
      const arts = await storage.getArticles(!isAdmin);
      res.json(arts);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar artigos" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const art = await storage.getArticle(req.params.id);
      if (!art) return res.status(404).json({ message: "Artigo não encontrado" });
      res.json(art);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar artigo" });
    }
  });

  app.get("/api/articles/:id/og", async (req, res) => {
    try {
      const art = await storage.getArticle(req.params.id);
      if (!art) return res.status(404).json({ message: "Artigo não encontrado" });
      res.json({
        title: art.title,
        description: art.excerpt || art.content.substring(0, 160),
        image: art.image || "https://i.imgur.com/i74pvbH.jpeg",
        url: `${req.protocol}://${req.get('host')}/noticias?artigo=${art.id}`,
      });
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar OG do artigo" });
    }
  });

  app.post("/api/articles", requireAdmin, async (req, res) => {
    try {
      const parsed = insertArticleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const art = await storage.createArticle(parsed.data);
      res.status(201).json(art);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar artigo" });
    }
  });

  app.put("/api/articles/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updateArticleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const art = await storage.updateArticle(req.params.id, parsed.data);
      if (!art) return res.status(404).json({ message: "Artigo não encontrado" });
      res.json(art);
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar artigo" });
    }
  });

  app.delete("/api/articles/:id", requireAdmin, async (req, res) => {
    try {
      const art = await storage.getArticle(req.params.id);
      if (!art) return res.status(404).json({ message: "Artigo não encontrado" });
      await storage.deleteArticle(req.params.id);
      res.json({ message: "Artigo excluído com sucesso" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir artigo" });
    }
  });

  app.post("/api/articles/:id/views", async (req, res) => {
    try {
      await storage.incrementArticleViews(req.params.id);
      res.json({ message: "Visualização registrada" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao registrar visualização" });
    }
  });

  app.get("/api/articles/:id/reactions", async (req, res) => {
    try {
      const counts = await storage.getArticleReactions(req.params.id);
      const userId = req.query.userId as string || "";
      const userReactions = userId ? await storage.getUserArticleReactions(req.params.id, userId) : [];
      res.json({ counts, userReactions });
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar reações" });
    }
  });

  app.post("/api/articles/:id/reactions", async (req, res) => {
    try {
      const { reactionType, anonymousUserId } = req.body;
      if (!reactionType || !anonymousUserId) {
        return res.status(400).json({ message: "reactionType e anonymousUserId são obrigatórios" });
      }
      const result = await storage.toggleArticleReaction(req.params.id, anonymousUserId, reactionType);
      const counts = await storage.getArticleReactions(req.params.id);
      const userReactions = await storage.getUserArticleReactions(req.params.id, anonymousUserId);
      res.json({ ...result, counts, userReactions });
    } catch (err) {
      res.status(500).json({ message: "Erro ao reagir ao artigo" });
    }
  });

  app.get("/api/articles/:id/comments", async (req, res) => {
    try {
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const session = await storage.getAdminSession(token);
        if (session && new Date(session.expiresAt) > new Date()) {
          isAdmin = true;
        }
      }
      const comments = await storage.getArticleComments(req.params.id, !isAdmin);
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar comentários" });
    }
  });

  app.post("/api/articles/:id/comments", async (req, res) => {
    try {
      const parsed = insertArticleCommentSchema.safeParse({ ...req.body, articleId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const comment = await storage.createArticleComment(parsed.data);
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar comentário" });
    }
  });

  app.get("/api/admin/comments", requireAdmin, async (_req, res) => {
    try {
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar comentários" });
    }
  });

  app.put("/api/admin/comments/:id/approve", requireAdmin, async (req, res) => {
    try {
      const comment = await storage.approveArticleComment(req.params.id);
      if (!comment) return res.status(404).json({ message: "Comentário não encontrado" });
      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: "Erro ao aprovar comentário" });
    }
  });

  app.delete("/api/admin/comments/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteArticleComment(req.params.id);
      res.json({ message: "Comentário excluído com sucesso" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir comentário" });
    }
  });

  // Marketing: Audiences
  app.get("/api/marketing/audiences", requireAdmin, async (_req, res) => {
    try {
      const audiences = await storage.getEmailAudiences();
      const result = await Promise.all(audiences.map(async (a) => {
        const leads = await storage.getAudienceLeads(a.id);
        return { ...a, leadCount: leads.length };
      }));
      res.json(result);
    } catch {
      res.status(500).json({ message: "Erro ao buscar audiências" });
    }
  });

  app.post("/api/marketing/audiences", requireAdmin, async (req, res) => {
    try {
      const parsed = insertEmailAudienceSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const audience = await storage.createEmailAudience(parsed.data);
      res.status(201).json(audience);
    } catch {
      res.status(500).json({ message: "Erro ao criar audiência" });
    }
  });

  app.delete("/api/marketing/audiences/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEmailAudience(req.params.id);
      res.json({ message: "Audiência removida" });
    } catch {
      res.status(500).json({ message: "Erro ao remover audiência" });
    }
  });

  app.get("/api/marketing/audiences/:id/leads", requireAdmin, async (req, res) => {
    try {
      const leads = await storage.getAudienceLeads(req.params.id);
      res.json(leads);
    } catch {
      res.status(500).json({ message: "Erro ao buscar leads" });
    }
  });

  app.post("/api/marketing/audiences/:id/leads", requireAdmin, async (req, res) => {
    try {
      const parsed = insertAudienceLeadSchema.safeParse({ ...req.body, audienceId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const lead = await storage.addAudienceLead(parsed.data);
      res.status(201).json(lead);
    } catch {
      res.status(500).json({ message: "Erro ao adicionar lead" });
    }
  });

  app.delete("/api/marketing/leads/:id", requireAdmin, async (req, res) => {
    try {
      await storage.removeAudienceLead(req.params.id);
      res.json({ message: "Lead removido" });
    } catch {
      res.status(500).json({ message: "Erro ao remover lead" });
    }
  });

  app.get("/api/marketing/leads/search", requireAdmin, async (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      const results = await storage.searchLeads(q);
      res.json(results);
    } catch {
      res.status(500).json({ message: "Erro ao buscar leads" });
    }
  });

  app.get("/api/marketing/leads/by-course", requireAdmin, async (req, res) => {
    try {
      const courseIds = req.query.courseIds as string | undefined;
      if (!courseIds) return res.json([]);
      const ids = courseIds.split(',').filter(Boolean);
      const results = await storage.getLeadsByCourseIds(ids);
      res.json(results);
    } catch {
      res.status(500).json({ message: "Erro ao buscar leads por curso" });
    }
  });

  app.get("/api/marketing/notification-subscriptions", requireAdmin, async (_req, res) => {
    try {
      const subs = await storage.getCourseNotificationSubscriptions();
      res.json(subs);
    } catch {
      res.status(500).json({ message: "Erro ao buscar inscrições de notificação" });
    }
  });

  // Marketing: Custom HTML Templates
  app.get("/api/marketing/html-templates", requireAdmin, async (_req, res) => {
    try {
      const templates = await storage.getCustomHtmlTemplates();
      res.json(templates);
    } catch {
      res.status(500).json({ message: "Erro ao buscar templates HTML" });
    }
  });

  app.post("/api/marketing/html-templates", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCustomHtmlTemplateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const tpl = await storage.createCustomHtmlTemplate(parsed.data);
      res.status(201).json(tpl);
    } catch {
      res.status(500).json({ message: "Erro ao criar template HTML" });
    }
  });

  app.put("/api/marketing/html-templates/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCustomHtmlTemplateSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const tpl = await storage.updateCustomHtmlTemplate(req.params.id, parsed.data);
      if (!tpl) return res.status(404).json({ message: "Template HTML não encontrado" });
      res.json(tpl);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar template HTML" });
    }
  });

  app.delete("/api/marketing/html-templates/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCustomHtmlTemplate(req.params.id);
      res.json({ message: "Template HTML removido" });
    } catch {
      res.status(500).json({ message: "Erro ao remover template HTML" });
    }
  });

  // Marketing: Templates
  app.get("/api/marketing/templates", requireAdmin, async (req, res) => {
    try {
      const trigger = req.query.trigger as string | undefined;
      const templates = trigger
        ? await storage.getEmailTemplatesByTrigger(trigger)
        : await storage.getEmailTemplates();
      res.json(templates);
    } catch {
      res.status(500).json({ message: "Erro ao buscar templates" });
    }
  });

  app.post("/api/marketing/templates", requireAdmin, async (req, res) => {
    try {
      const parsed = insertEmailTemplateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const tpl = await storage.createEmailTemplate(parsed.data);
      res.status(201).json(tpl);
    } catch {
      res.status(500).json({ message: "Erro ao criar template" });
    }
  });

  app.put("/api/marketing/templates/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertEmailTemplateSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const tpl = await storage.updateEmailTemplate(req.params.id, parsed.data);
      if (!tpl) return res.status(404).json({ message: "Template não encontrado" });
      res.json(tpl);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar template" });
    }
  });

  app.delete("/api/marketing/templates/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEmailTemplate(req.params.id);
      res.json({ message: "Template removido" });
    } catch {
      res.status(500).json({ message: "Erro ao remover template" });
    }
  });

  // Marketing: Campaigns CRUD
  app.get("/api/marketing/campaigns", requireAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch {
      res.status(500).json({ message: "Erro ao buscar campanhas" });
    }
  });

  app.get("/api/marketing/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ message: "Campanha não encontrada" });
      res.json(campaign);
    } catch {
      res.status(500).json({ message: "Erro ao buscar campanha" });
    }
  });

  app.post("/api/marketing/campaigns", requireAdmin, async (req, res) => {
    try {
      const parsed = insertEmailCampaignSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const campaign = await storage.createEmailCampaign(parsed.data);
      res.status(201).json(campaign);
    } catch {
      res.status(500).json({ message: "Erro ao criar campanha" });
    }
  });

  app.put("/api/marketing/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertEmailCampaignSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const campaign = await storage.updateEmailCampaign(req.params.id, parsed.data);
      if (!campaign) return res.status(404).json({ message: "Campanha não encontrada" });
      res.json(campaign);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar campanha" });
    }
  });

  app.delete("/api/marketing/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEmailCampaign(req.params.id);
      res.json({ message: "Campanha removida" });
    } catch {
      res.status(500).json({ message: "Erro ao remover campanha" });
    }
  });

  // Marketing: Tracking pixel for email opens
  app.get("/api/marketing/track/open/:campaignId/:leadId", async (req, res) => {
    try {
      const { campaignId, leadId } = req.params;
      const campaign = await storage.getEmailCampaign(campaignId);
      if (campaign) {
        const leads = await storage.getAudienceLeads(campaign.audienceId);
        const leadBelongs = leads.some(l => l.id === leadId);
        if (leadBelongs) {
          await storage.trackCampaignOpen(campaignId, leadId);
        }
      }
    } catch {
      // Silently fail - tracking should not break email experience
    }
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.end(pixel);
  });

  // Marketing: Analytics endpoint
  app.get("/api/marketing/analytics", requireAdmin, async (_req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
      const totalErrors = campaigns.reduce((sum, c) => sum + (c.errorCount ?? 0), 0);
      const totalOpens = campaigns.reduce((sum, c) => sum + (c.openCount ?? 0), 0);
      const openRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
      res.json({ totalSent, totalErrors, totalOpens, openRate, campaigns });
    } catch {
      res.status(500).json({ message: "Erro ao buscar analytics" });
    }
  });

  // Marketing: Send campaign
  app.post("/api/marketing/send", requireAdmin, async (req, res) => {
    try {
      const { audienceId, templateId, customHtmlTemplateId, subject: manualSubject } = req.body;
      if (!audienceId) return res.status(400).json({ message: "audienceId é obrigatório" });
      if (!templateId && !customHtmlTemplateId) return res.status(400).json({ message: "templateId ou customHtmlTemplateId são obrigatórios" });
      if (customHtmlTemplateId && !templateId && (!manualSubject || !manualSubject.trim())) {
        return res.status(400).json({ message: "Assunto do e-mail é obrigatório quando não há template Markdown" });
      }

      const leads = await storage.getAudienceLeads(audienceId);
      if (leads.length === 0) return res.status(400).json({ message: "Audiência sem leads" });

      let emailSubject: string;
      let htmlBody: string;

      if (customHtmlTemplateId) {
        const htmlTpl = await storage.getCustomHtmlTemplate(customHtmlTemplateId);
        if (!htmlTpl) return res.status(404).json({ message: "Template HTML não encontrado" });
        htmlBody = htmlTpl.htmlContent;
        if (templateId) {
          const tpl = await storage.getEmailTemplate(templateId);
          emailSubject = tpl ? tpl.subject : (manualSubject ?? 'Mensagem');
        } else {
          emailSubject = manualSubject ?? 'Mensagem';
        }
      } else {
        const tpl = await storage.getEmailTemplate(templateId);
        if (!tpl) return res.status(404).json({ message: "Template não encontrado" });
        emailSubject = tpl.subject;
        htmlBody = await markdownToHtml(tpl.body);
      }

      let sent = 0;
      let failed = 0;

      const campaignRecord = await storage.createEmailCampaign({
        audienceId,
        templateId: templateId ?? null,
        customHtmlTemplateId: customHtmlTemplateId ?? null,
        sentCount: 0,
        errorCount: 0,
        subject: emailSubject,
      });

      const appBaseUrl = process.env.APP_URL
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
        || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null);

      for (const lead of leads) {
        let bodyWithTracking = htmlBody;
        if (appBaseUrl) {
          const trackingPixel = `<img src="${appBaseUrl}/api/marketing/track/open/${campaignRecord.id}/${lead.id}" width="1" height="1" style="display:none" alt="" />`;
          bodyWithTracking = htmlBody + trackingPixel;
        }
        const rendered = renderTemplate(bodyWithTracking, { nome: lead.name, email: lead.email });
        const ok = await sendEmailViaResend(lead.email, emailSubject, rendered);
        if (ok) sent++; else failed++;
      }

      await storage.updateEmailCampaign(campaignRecord.id, { sentCount: sent, errorCount: failed });
      res.json({ message: "Campanha disparada", sent, failed });
    } catch {
      res.status(500).json({ message: "Erro ao disparar campanha" });
    }
  });

  // Marketing: Send individual/bulk email for capacitacao integration
  app.post("/api/marketing/send-direct", requireAdmin, async (req, res) => {
    try {
      const { emails, templateId, vars } = req.body as { emails: string[]; templateId: string; vars?: Record<string, string> };
      if (!emails?.length || !templateId) return res.status(400).json({ message: "emails e templateId são obrigatórios" });
      const tpl = await storage.getEmailTemplate(templateId);
      if (!tpl) return res.status(404).json({ message: "Template não encontrado" });
      const htmlBody = await markdownToHtml(tpl.body);
      let sent = 0;
      let failed = 0;
      for (const email of emails) {
        const rendered = renderTemplate(htmlBody, { email, nome: email, ...(vars ?? {}) });
        const ok = await sendEmailViaResend(email, tpl.subject, rendered);
        if (ok) sent++; else failed++;
      }
      res.json({ message: "E-mails enviados", sent, failed });
    } catch {
      res.status(500).json({ message: "Erro ao enviar e-mails" });
    }
  });

  app.get("/api/admin/proposals", requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getProposals();
      res.json(list);
    } catch {
      res.status(500).json({ message: "Erro ao buscar propostas" });
    }
  });

  app.get("/api/admin/proposals/:id", requireAdmin, async (req, res) => {
    try {
      const p = await storage.getProposal(req.params.id);
      if (!p) return res.status(404).json({ message: "Proposta não encontrada" });
      res.json(p);
    } catch {
      res.status(500).json({ message: "Erro ao buscar proposta" });
    }
  });

  app.post("/api/admin/proposals", requireAdmin, async (req, res) => {
    try {
      const parsed = insertProposalSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten() });
      const created = await storage.createProposal(parsed.data);
      res.status(201).json(created);
    } catch {
      res.status(500).json({ message: "Erro ao criar proposta" });
    }
  });

  // Atualizar proposta (rascunho ou dados gerais)
  app.patch("/api/admin/proposals/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateProposal(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Proposta não encontrada" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar proposta" });
    }
  });

  app.patch("/api/admin/proposals/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body as { status: string };
      if (!PROPOSAL_STATUSES.includes(status as any))
        return res.status(400).json({ message: "Status inválido" });
      const updated = await storage.updateProposalStatus(req.params.id, status as ProposalStatus);
      if (!updated) return res.status(404).json({ message: "Proposta não encontrada" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar status" });
    }
  });

  app.delete("/api/admin/proposals/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProposal(req.params.id);
      res.json({ message: "Proposta excluída" });
    } catch {
      res.status(500).json({ message: "Erro ao excluir proposta" });
    }
  });

  // Salvar PDF base64 em uma proposal existente
  app.patch("/api/admin/proposals/:id/pdf", requireAdmin, async (req, res) => {
    try {
      const { pdfData } = req.body as { pdfData: string };
      if (!pdfData) return res.status(400).json({ message: "pdfData é obrigatório" });
      const updated = await storage.updateProposalPdf(req.params.id, pdfData);
      if (!updated) return res.status(404).json({ message: "Proposta não encontrada" });
      res.json({ message: "PDF salvo com sucesso" });
    } catch {
      res.status(500).json({ message: "Erro ao salvar PDF" });
    }
  });

  // Servir PDF de uma proposal como arquivo
  app.get("/api/admin/proposals/:id/pdf", requireAdmin, async (req, res) => {
    try {
      const p = await storage.getProposal(req.params.id);
      if (!p || !p.pdfData) return res.status(404).json({ message: "PDF não encontrado" });
      const buffer = Buffer.from(p.pdfData, "base64");
      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${p.tipo}_${p.numero}.pdf"`,
      });
      res.send(buffer);
    } catch {
      res.status(500).json({ message: "Erro ao buscar PDF" });
    }
  });

  // Upload de PDF assinado
  app.patch("/api/admin/proposals/:id/signed-pdf", requireAdmin, async (req, res) => {
    try {
      const { pdfAssinado } = req.body as { pdfAssinado: string };
      if (!pdfAssinado) return res.status(400).json({ message: "pdfAssinado é obrigatório" });
      const updated = await storage.uploadSignedPdf(req.params.id, pdfAssinado);
      if (!updated) return res.status(404).json({ message: "Proposta não encontrada" });
      res.json({ message: "PDF assinado salvo com sucesso" });
    } catch {
      res.status(500).json({ message: "Erro ao salvar PDF assinado" });
    }
  });

  // Servir PDF assinado
  app.get("/api/admin/proposals/:id/signed-pdf", requireAdmin, async (req, res) => {
    try {
      const p = await storage.getProposal(req.params.id);
      if (!p || !p.pdfAssinado) return res.status(404).json({ message: "PDF assinado não encontrado" });
      const buffer = Buffer.from(p.pdfAssinado, "base64");
      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${p.tipo}_${p.numero}_assinado.pdf"`,
      });
      res.send(buffer);
    } catch {
      res.status(500).json({ message: "Erro ao buscar PDF assinado" });
    }
  });

  // Marcar documento como enviado (timeline)
  app.patch("/api/admin/proposals/:id/mark-sent", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.markProposalSent(req.params.id);
      if (!updated) return res.status(404).json({ message: "Proposta não encontrada" });
      res.json({ message: "Documento marcado como enviado" });
    } catch {
      res.status(500).json({ message: "Erro ao marcar como enviado" });
    }
  });

  // Enviar documento por e-mail com PDF anexo
  app.post("/api/admin/proposals/:id/email", requireAdmin, async (req, res) => {
    try {
      const { to, subject, message } = req.body as { to: string; subject?: string; message?: string };
      if (!to) return res.status(400).json({ message: "Destinatário (to) é obrigatório" });
      const p = await storage.getProposal(req.params.id);
      if (!p) return res.status(404).json({ message: "Proposta não encontrada" });
      // Preferir PDF assinado; fallback para PDF original
      const pdfContent = p.pdfAssinado || p.pdfData;
      if (!pdfContent) return res.status(400).json({ message: "Este documento não possui PDF salvo" });

      if (!RESEND_API_KEY) return res.status(400).json({ message: "RESEND_API_KEY não configurada" });

      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      const tipoLabel = p.tipo === 'contrato' ? 'Contrato' : p.tipo === 'orcamento' ? 'Orçamento' : p.tipo === 'oficio' ? 'Ofício' : p.tipo === 'relatorio' ? 'Relatório' : 'Proposta de Projeto';
      const emailSubject = subject || `${tipoLabel} ${p.numero} — IDASAM`;
      const emailBody = message || `Prezado(a),\n\nSegue em anexo o documento <strong>${tipoLabel} nº ${p.numero}</strong> — ${p.titulo}.\n\nAtenciosamente,\nIDASSAM`;

      const suffix = p.pdfAssinado ? '_assinado' : '';
      const filename = `${p.tipo}_${p.numero.replace(/\//g, '-')}${suffix}.pdf`;

      const result = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: emailSubject,
        html: wrapEmailHtml(emailBody.replace(/\n/g, '<br>')),
        attachments: [{
          filename,
          content: pdfContent,
        }],
      });

      if (result.error) return res.status(500).json({ message: "Erro ao enviar e-mail", error: result.error });

      // Marcar como enviado na timeline
      await storage.markProposalSent(req.params.id);

      res.json({ message: "E-mail enviado com sucesso" });
    } catch (e) {
      console.error("Erro ao enviar e-mail com PDF:", e);
      res.status(500).json({ message: "Erro ao enviar e-mail" });
    }
  });

  // ══════════════════════════════════════════════
  // SIGNATÁRIOS CRUD
  // ══════════════════════════════════════════════
  app.get("/api/admin/signatarios", requireAdmin, async (_req, res) => {
    try { res.json(await storage.getSignatarios()); }
    catch { res.status(500).json({ message: "Erro ao buscar signatários" }); }
  });
  app.post("/api/admin/signatarios", requireAdmin, async (req, res) => {
    try {
      const parsed = insertSignatarioSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten() });
      res.status(201).json(await storage.createSignatario(parsed.data));
    } catch { res.status(500).json({ message: "Erro ao criar signatário" }); }
  });
  app.patch("/api/admin/signatarios/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSignatario(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Signatário não encontrado" });
      res.json(updated);
    } catch { res.status(500).json({ message: "Erro ao atualizar signatário" }); }
  });
  app.delete("/api/admin/signatarios/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteSignatario(req.params.id); res.json({ message: "Signatário excluído" }); }
    catch { res.status(500).json({ message: "Erro ao excluir signatário" }); }
  });

  // ══════════════════════════════════════════════
  // DELEGAÇÕES DE PODERES
  // ══════════════════════════════════════════════
  app.get("/api/admin/delegacoes", requireAdmin, async (_req, res) => {
    try { res.json(await storage.getDelegacoes()); }
    catch { res.status(500).json({ message: "Erro ao buscar delegações" }); }
  });
  app.get("/api/admin/delegacoes/ativas", requireAdmin, async (_req, res) => {
    try { res.json(await storage.getDelegacoesAtivas()); }
    catch { res.status(500).json({ message: "Erro ao buscar delegações ativas" }); }
  });
  app.post("/api/admin/delegacoes", requireAdmin, async (req, res) => {
    try {
      const { deleganteId, delegadoId, motivo, poderes, validaDe, validaAte } = req.body;
      if (!deleganteId || !delegadoId || !motivo || !poderes || !validaDe || !validaAte)
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });

      // Validar que o delegante é Presidente
      const delegante = await storage.getSignatario(deleganteId);
      if (!delegante || delegante.role !== 'presidente')
        return res.status(403).json({ message: "Apenas o Presidente pode delegar poderes (Art. 22, IV do Estatuto)" });

      // Gerar número do ato
      const year = new Date().getFullYear();
      const all = await storage.getDelegacoes();
      const seq = all.filter(d => d.numero.includes(`/${year}`)).length + 1;
      const numero = `${String(seq).padStart(3, '0')}/${year}`;

      const delegacao = await storage.createDelegacao({
        numero,
        deleganteId,
        delegadoId,
        motivo,
        poderes: typeof poderes === 'string' ? poderes : JSON.stringify(poderes),
        validaDe: new Date(validaDe),
        validaAte: new Date(validaAte),
        status: 'ativa',
      });
      res.status(201).json(delegacao);
    } catch (e) {
      console.error("Erro ao criar delegação:", e);
      res.status(500).json({ message: "Erro ao criar delegação" });
    }
  });
  app.patch("/api/admin/delegacoes/:id/revogar", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.revogaDelegacao(req.params.id);
      if (!updated) return res.status(404).json({ message: "Delegação não encontrada" });
      res.json(updated);
    } catch { res.status(500).json({ message: "Erro ao revogar delegação" }); }
  });
  app.patch("/api/admin/delegacoes/:id/ato-pdf", requireAdmin, async (req, res) => {
    try {
      const { atoDesignacaoPdf } = req.body;
      if (!atoDesignacaoPdf) return res.status(400).json({ message: "PDF é obrigatório" });
      const updated = await storage.updateDelegacaoAtoPdf(req.params.id, atoDesignacaoPdf);
      if (!updated) return res.status(404).json({ message: "Delegação não encontrada" });
      res.json({ message: "Ato de Designação salvo" });
    } catch { res.status(500).json({ message: "Erro ao salvar Ato" }); }
  });
  app.get("/api/admin/delegacoes/:id/ato-pdf", requireAdmin, async (req, res) => {
    try {
      const d = await storage.getDelegacao(req.params.id);
      if (!d || !d.atoDesignacaoPdf) return res.status(404).json({ message: "Ato não encontrado" });
      const buffer = Buffer.from(d.atoDesignacaoPdf, "base64");
      res.set({ "Content-Type": "application/pdf", "Content-Length": buffer.length.toString(), "Content-Disposition": `inline; filename="Ato_Designacao_${d.numero.replace(/\//g, '-')}.pdf"` });
      res.send(buffer);
    } catch { res.status(500).json({ message: "Erro ao buscar Ato" }); }
  });
  // Verificar poderes de um signatário (usado pelo frontend)
  app.get("/api/admin/signatarios/:id/poderes", requireAdmin, async (req, res) => {
    try {
      const sig = await storage.getSignatario(req.params.id);
      if (!sig) return res.status(404).json({ message: "Signatário não encontrado" });

      // Presidente e Vice-Presidente podem assinar diretamente (Art. 22)
      if (sig.role === 'presidente' || sig.role === 'vice_presidente') {
        return res.json({ podeAssinar: true, tipo: 'cargo_direto', role: sig.role, delegacao: null });
      }

      // Outros: verificar delegação ativa
      const delegacoesAtivas = await storage.getDelegacoesAtivasParaSignatario(sig.id);
      if (delegacoesAtivas.length > 0) {
        const d = delegacoesAtivas[0];
        return res.json({ podeAssinar: true, tipo: 'delegacao', role: sig.role, delegacao: { id: d.id, numero: d.numero, poderes: d.poderes } });
      }

      res.json({ podeAssinar: false, tipo: 'sem_poderes', role: sig.role, delegacao: null });
    } catch { res.status(500).json({ message: "Erro ao verificar poderes" }); }
  });

  // ══════════════════════════════════════════════
  // ASSINATURA INTERNA (admin assina pelo IDASAM)
  // ══════════════════════════════════════════════
  app.post("/api/admin/proposals/:id/sign-internal", requireAdmin, async (req, res) => {
    try {
      const { signatarioId, pdfAssinado, documentHash, delegacaoId } = req.body as { signatarioId: string; pdfAssinado: string; documentHash: string; delegacaoId?: string };
      if (!signatarioId || !pdfAssinado || !documentHash) return res.status(400).json({ message: "signatarioId, pdfAssinado e documentHash são obrigatórios" });
      const signatario = await storage.getSignatario(signatarioId);
      if (!signatario) return res.status(404).json({ message: "Signatário não encontrado" });

      // Validar poderes de assinatura conforme Estatuto (Art. 22)
      if (signatario.role !== 'presidente' && signatario.role !== 'vice_presidente') {
        const delegacoesAtivas = await storage.getDelegacoesAtivasParaSignatario(signatarioId);
        if (delegacoesAtivas.length === 0) {
          return res.status(403).json({ message: `${signatario.nome} não possui poderes de assinatura. É necessário delegação ativa do Presidente (Art. 22, IV do Estatuto).` });
        }
      }

      await storage.uploadSignedPdf(req.params.id, pdfAssinado);
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
      await storage.createAssinaturaLog({
        proposalId: req.params.id,
        signerName: signatario.nome,
        signerEmail: signatario.email,
        signerCpf: null,
        signerIp: ip,
        signerUserAgent: req.headers['user-agent'] || null,
        signatureType: 'internal' as SignatureType,
        signatureImage: null,
        documentHash,
        signatarioId,
        delegacaoId: delegacaoId || null,
      });
      res.json({ message: "Documento assinado internamente" });
    } catch (e) {
      console.error("Erro ao assinar internamente:", e);
      res.status(500).json({ message: "Erro ao assinar documento" });
    }
  });

  // ══════════════════════════════════════════════
  // SOLICITAR ASSINATURA EXTERNA (gera link)
  // ══════════════════════════════════════════════
  app.post("/api/admin/proposals/:id/request-external-signature", requireAdmin, async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) return res.status(404).json({ message: "Proposta não encontrada" });
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      const link = await storage.createAssinaturaLink({
        proposalId: req.params.id,
        token,
        signerName: proposal.cliNome || undefined,
        signerEmail: proposal.cliEmail || undefined,
        expiresAt,
      });
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fullLink = `${baseUrl}/assinar/${token}`;

      // Enviar email com o link se tiver cliEmail
      if (proposal.cliEmail && RESEND_API_KEY) {
        const tipoLabel = proposal.tipo === 'contrato' ? 'Contrato' : proposal.tipo === 'orcamento' ? 'Orçamento' : proposal.tipo === 'oficio' ? 'Ofício' : proposal.tipo === 'relatorio' ? 'Relatório' : 'Proposta de Projeto';
        await sendEmailViaResend(
          proposal.cliEmail,
          `Assinatura solicitada — ${tipoLabel} ${proposal.numero}`,
          `Prezado(a) ${proposal.cliNome},<br><br>O IDASAM solicita sua assinatura no documento <strong>${tipoLabel} nº ${proposal.numero}</strong> — ${proposal.titulo}.<br><br><a href="${fullLink}" style="display:inline-block;background:#1a5c38;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Assinar Documento</a><br><br>Este link expira em 7 dias.<br><br>Atenciosamente,<br>IDASAM`
        );
      }

      res.json({ token, link: fullLink, expiresAt: link.expiresAt });
    } catch (e) {
      console.error("Erro ao solicitar assinatura externa:", e);
      res.status(500).json({ message: "Erro ao gerar link de assinatura" });
    }
  });

  // ══════════════════════════════════════════════
  // AUDIT TRAIL
  // ══════════════════════════════════════════════
  app.get("/api/admin/proposals/:id/signature-logs", requireAdmin, async (req, res) => {
    try { res.json(await storage.getAssinaturaLogsByProposal(req.params.id)); }
    catch { res.status(500).json({ message: "Erro ao buscar logs de assinatura" }); }
  });

  // ══════════════════════════════════════════════
  // ROTAS PÚBLICAS — assinatura externa (sem auth)
  // ══════════════════════════════════════════════
  // Validação pública de documento por hash
  app.get("/api/public/validar/:hash", async (req, res) => {
    try {
      const logs = await db.select().from(assinaturaLogsTable).where(eq(assinaturaLogsTable.documentHash, req.params.hash)).orderBy(desc(assinaturaLogsTable.createdAt));
      if (logs.length === 0) return res.status(404).json({ valid: false, message: "Documento não encontrado" });
      const log = logs[0];
      const proposal = await storage.getProposal(log.proposalId);
      const tipoLabel = proposal?.tipo === 'contrato' ? 'Contrato' : proposal?.tipo === 'orcamento' ? 'Orçamento' : proposal?.tipo === 'oficio' ? 'Ofício' : proposal?.tipo === 'relatorio' ? 'Relatório' : 'Proposta de Projeto';
      res.json({
        valid: true,
        documento: proposal ? `${tipoLabel} nº ${proposal.numero}` : 'Documento',
        titulo: proposal?.titulo || '',
        signerName: log.signerName,
        signatureType: log.signatureType,
        signedAt: log.createdAt,
        hash: log.documentHash,
      });
    } catch { res.status(500).json({ valid: false, message: "Erro ao validar" }); }
  });

  app.get("/api/public/my-ip", (req, res) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    res.json({ ip });
  });

  app.get("/api/public/assinar/:token", async (req, res) => {
    try {
      const link = await storage.getAssinaturaLinkByToken(req.params.token);
      if (!link) return res.status(404).json({ message: "Link de assinatura não encontrado" });
      if (link.usedAt) return res.status(409).json({ message: "Este documento já foi assinado" });
      if (new Date() > new Date(link.expiresAt)) return res.status(410).json({ message: "Link de assinatura expirado" });

      const proposal = await storage.getProposal(link.proposalId);
      if (!proposal) return res.status(404).json({ message: "Documento não encontrado" });

      // Retornar o PDF mais recente (assinado internamente ou original)
      const pdfContent = proposal.pdfAssinado || proposal.pdfData;

      res.json({
        titulo: proposal.titulo,
        numero: proposal.numero,
        tipo: proposal.tipo,
        signerName: link.signerName,
        signerEmail: link.signerEmail,
        pdfBase64: pdfContent,
      });
    } catch { res.status(500).json({ message: "Erro ao carregar documento para assinatura" }); }
  });

  app.post("/api/public/assinar/:token", async (req, res) => {
    try {
      const link = await storage.getAssinaturaLinkByToken(req.params.token);
      if (!link) return res.status(404).json({ message: "Link não encontrado" });
      if (link.usedAt) return res.status(409).json({ message: "Documento já assinado" });
      if (new Date() > new Date(link.expiresAt)) return res.status(410).json({ message: "Link expirado" });

      const { signerName, signerCpf, signatureImage, pdfAssinado, documentHash } = req.body as {
        signerName: string; signerCpf: string; signatureImage: string; pdfAssinado: string; documentHash: string;
      };
      if (!signerName || !signerCpf || !pdfAssinado || !documentHash) {
        return res.status(400).json({ message: "Nome, CPF, PDF assinado e hash são obrigatórios" });
      }

      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || null;

      // Salvar PDF assinado na proposal
      await storage.uploadSignedPdf(link.proposalId, pdfAssinado);
      // Marcar link como usado
      await storage.markAssinaturaLinkUsed(req.params.token);
      // Criar audit log
      await storage.createAssinaturaLog({
        proposalId: link.proposalId,
        signerName,
        signerCpf,
        signerEmail: link.signerEmail,
        signerIp: ip,
        signerUserAgent: userAgent,
        signatureType: 'external' as SignatureType,
        signatureImage,
        documentHash,
        signatarioId: null,
      });

      res.json({ message: "Documento assinado com sucesso" });
    } catch (e) {
      console.error("Erro na assinatura externa:", e);
      res.status(500).json({ message: "Erro ao processar assinatura" });
    }
  });

  // ══════════════════════════════════════════════════════════
  // CRM Routes
  // ══════════════════════════════════════════════════════════

  // Admin CRUD
  app.get("/api/admin/crm/stakeholders", requireAdmin, async (_req, res) => {
    const list = await storage.getCrmStakeholders();
    res.json(list);
  });

  app.get("/api/admin/crm/stakeholders/:id", requireAdmin, async (req, res) => {
    const stakeholder = await storage.getCrmStakeholder(req.params.id);
    if (!stakeholder) return res.status(404).json({ message: "Stakeholder não encontrado" });
    const subdata = await storage.getCrmSubdata(stakeholder.id, stakeholder.tipo);
    res.json({ ...stakeholder, subdata });
  });

  app.post("/api/admin/crm/stakeholders", requireAdmin, async (req, res) => {
    try {
      const { subdata, ...mainData } = req.body;
      const stakeholder = await storage.createCrmStakeholder(mainData);
      if (subdata && Object.keys(subdata).length > 0) {
        await storage.upsertCrmSubdata(stakeholder.id, stakeholder.tipo, subdata);
      }
      res.json(stakeholder);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Erro ao criar stakeholder" });
    }
  });

  app.patch("/api/admin/crm/stakeholders/:id", requireAdmin, async (req, res) => {
    try {
      const { subdata, ...mainData } = req.body;
      const stakeholder = await storage.updateCrmStakeholder(req.params.id, mainData);
      if (!stakeholder) return res.status(404).json({ message: "Stakeholder não encontrado" });
      if (subdata && Object.keys(subdata).length > 0) {
        await storage.upsertCrmSubdata(stakeholder.id, stakeholder.tipo, subdata);
      }
      res.json(stakeholder);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Erro ao atualizar" });
    }
  });

  app.delete("/api/admin/crm/stakeholders/:id", requireAdmin, async (req, res) => {
    await storage.deleteCrmStakeholder(req.params.id);
    res.json({ message: "Removido" });
  });

  // LGPD consent link (public)
  app.get("/api/public/crm/lgpd/:token", async (req, res) => {
    const stakeholder = await storage.getCrmStakeholderByToken(req.params.token);
    if (!stakeholder) return res.status(404).json({ message: "Link inválido" });
    res.json({ nome: stakeholder.nome, email: stakeholder.email, tipo: stakeholder.tipo, lgpdConsentimento: stakeholder.lgpdConsentimento });
  });

  app.post("/api/public/crm/lgpd/:token/consent", async (req, res) => {
    const stakeholder = await storage.getCrmStakeholderByToken(req.params.token);
    if (!stakeholder) return res.status(404).json({ message: "Link inválido" });
    if (stakeholder.lgpdConsentimento) return res.json({ message: "Consentimento já registrado" });
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
    await storage.updateCrmLgpdConsent(stakeholder.id, ip);
    res.json({ message: "Consentimento registrado com sucesso" });
  });

  // Public self-registration
  app.post("/api/public/crm/register", async (req, res) => {
    try {
      const { subdata, lgpdConsent, ...mainData } = req.body;
      if (!lgpdConsent) return res.status(400).json({ message: "Consentimento LGPD obrigatório" });
      const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
      const stakeholder = await storage.createCrmStakeholder({
        ...mainData,
        lgpdConsentimento: true,
        status: 'ativo',
      });
      await storage.updateCrmLgpdConsent(stakeholder.id, ip);
      if (subdata && Object.keys(subdata).length > 0) {
        await storage.upsertCrmSubdata(stakeholder.id, mainData.tipo, subdata);
      }
      res.json({ message: "Cadastro realizado com sucesso", id: stakeholder.id });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Erro no cadastro" });
    }
  });

  // Documents
  app.get("/api/admin/crm/stakeholders/:id/documentos", requireAdmin, async (req, res) => {
    res.json(await storage.getCrmDocumentos(req.params.id));
  });

  app.post("/api/admin/crm/stakeholders/:id/documentos", requireAdmin, async (req, res) => {
    const doc = await storage.createCrmDocumento({ ...req.body, stakeholderId: req.params.id });
    res.json(doc);
  });

  app.delete("/api/admin/crm/documentos/:id", requireAdmin, async (req, res) => {
    await storage.deleteCrmDocumento(req.params.id);
    res.json({ message: "Documento removido" });
  });

  // Receipts
  app.get("/api/admin/crm/stakeholders/:id/recibos", requireAdmin, async (req, res) => {
    res.json(await storage.getCrmRecibos(req.params.id));
  });

  app.post("/api/admin/crm/stakeholders/:id/recibos", requireAdmin, async (req, res) => {
    const recibo = await storage.createCrmRecibo({ ...req.body, stakeholderId: req.params.id });
    res.json(recibo);
  });

  // Interactions
  app.get("/api/admin/crm/stakeholders/:id/interacoes", requireAdmin, async (req, res) => {
    res.json(await storage.getCrmInteracoes(req.params.id));
  });

  app.post("/api/admin/crm/stakeholders/:id/interacoes", requireAdmin, async (req, res) => {
    const interacao = await storage.createCrmInteracao({ ...req.body, stakeholderId: req.params.id });
    res.json(interacao);
  });

  // Banking data
  app.get("/api/admin/crm/stakeholders/:id/bancarios", requireAdmin, async (req, res) => {
    res.json(await storage.getCrmDadosBancarios(req.params.id));
  });

  app.post("/api/admin/crm/stakeholders/:id/bancarios", requireAdmin, async (req, res) => {
    const dados = await storage.createCrmDadosBancarios({ ...req.body, stakeholderId: req.params.id });
    res.json(dados);
  });

  app.patch("/api/admin/crm/bancarios/:id", requireAdmin, async (req, res) => {
    const dados = await storage.updateCrmDadosBancarios(req.params.id, req.body);
    if (!dados) return res.status(404).json({ message: "Não encontrado" });
    res.json(dados);
  });

  app.delete("/api/admin/crm/bancarios/:id", requireAdmin, async (req, res) => {
    await storage.deleteCrmDadosBancarios(req.params.id);
    res.json({ message: "Dados bancários removidos" });
  });

  // Send LGPD consent email
  app.post("/api/admin/crm/stakeholders/:id/send-lgpd", requireAdmin, async (req, res) => {
    const stakeholder = await storage.getCrmStakeholder(req.params.id);
    if (!stakeholder) return res.status(404).json({ message: "Stakeholder não encontrado" });
    if (stakeholder.lgpdConsentimento) return res.json({ message: "Consentimento já registrado" });
    if (!stakeholder.tokenPublico) return res.status(400).json({ message: "Token público não encontrado" });

    const origin = req.headers.origin || `${req.protocol}://${req.headers.host}`;
    const lgpdLink = `${origin}/lgpd/${stakeholder.tokenPublico}`;

    const htmlBody = `
      <h2 style="color:#1a5c38;margin-bottom:16px">Consentimento LGPD</h2>
      <p>Olá, <strong>${stakeholder.nome}</strong>!</p>
      <p>O <strong>IDASAM — Instituto de Desenvolvimento Ambiental e Social da Amazônia</strong> solicita seu consentimento para o tratamento dos seus dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
      <p>Para visualizar os termos e registrar seu consentimento, clique no botão abaixo:</p>
      <div style="text-align:center;margin:28px 0">
        <a href="${lgpdLink}" style="background:#1a5c38;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
          Acessar Termo de Consentimento
        </a>
      </div>
      <p style="font-size:13px;color:#666">Se preferir, copie e cole o link abaixo no navegador:<br>
      <a href="${lgpdLink}" style="color:#1a5c38;word-break:break-all">${lgpdLink}</a></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#999">Este e-mail foi enviado pelo sistema IDASAM. Caso não reconheça este contato, desconsidere esta mensagem.</p>
    `;

    const ok = await sendEmailViaResend(stakeholder.email, 'IDASAM — Consentimento LGPD', htmlBody);
    if (ok) {
      res.json({ message: `E-mail enviado para ${stakeholder.email}` });
    } else {
      res.status(500).json({ message: "Erro ao enviar e-mail. Verifique a configuração do RESEND_API_KEY." });
    }
  });

  // Send custom email to stakeholder
  app.post("/api/admin/crm/stakeholders/:id/send-email", requireAdmin, async (req, res) => {
    const stakeholder = await storage.getCrmStakeholder(req.params.id);
    if (!stakeholder) return res.status(404).json({ message: "Stakeholder não encontrado" });

    const { to, subject, message, includeLgpdLink } = req.body;
    const email = to || stakeholder.email;
    if (!email || !subject) return res.status(400).json({ message: "Destinatário e assunto são obrigatórios" });

    let htmlBody = `<p>${(message || '').replace(/\n/g, '<br>')}</p>`;

    if (includeLgpdLink && stakeholder.tokenPublico && !stakeholder.lgpdConsentimento) {
      const origin = req.headers.origin || `${req.protocol}://${req.headers.host}`;
      const lgpdLink = `${origin}/lgpd/${stakeholder.tokenPublico}`;
      htmlBody += `
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:14px"><strong>Consentimento LGPD</strong></p>
        <p style="font-size:13px">Para registrar seu consentimento ao tratamento de dados, clique no botão abaixo:</p>
        <div style="text-align:center;margin:20px 0">
          <a href="${lgpdLink}" style="background:#1a5c38;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
            Acessar Termo LGPD
          </a>
        </div>
      `;
    }

    const ok = await sendEmailViaResend(email, subject, htmlBody);
    if (ok) {
      // Register interaction
      await storage.createCrmInteracao({
        stakeholderId: stakeholder.id,
        tipo: 'email',
        descricao: `E-mail enviado: "${subject}" para ${email}`,
        data: new Date(),
        responsavel: 'Admin',
      });
      res.json({ message: `E-mail enviado para ${email}` });
    } else {
      res.status(500).json({ message: "Erro ao enviar e-mail. Verifique a configuração do RESEND_API_KEY." });
    }
  });

  // Newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const parsed = insertNewsletterSubscriberSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || "Dados inválidos" });
      const subscriber = await storage.createNewsletterSubscriber(parsed.data);

      // Sync with Marketing — add to "Newsletter IDASAM" audience
      try {
        const audiences = await storage.getEmailAudiences();
        let newsletterAudience = audiences.find(a => a.name === 'Newsletter IDASAM');
        if (!newsletterAudience) {
          newsletterAudience = await storage.createEmailAudience({ name: 'Newsletter IDASAM' });
        }
        await storage.addAudienceLead({
          audienceId: newsletterAudience.id,
          name: parsed.data.name,
          email: parsed.data.email,
        });
      } catch (_syncErr) {
        // Sync failure shouldn't block subscription
      }

      res.json({ message: "Inscrição realizada com sucesso!", id: subscriber.id });
    } catch (e: any) {
      if (e.code === '23505') return res.json({ message: "Você já está inscrito na newsletter!" });
      res.status(500).json({ message: "Erro ao processar inscrição" });
    }
  });

  app.get("/api/admin/newsletter", requireAdmin, async (_req, res) => {
    res.json(await storage.getNewsletterSubscribers());
  });

  app.patch("/api/admin/newsletter/:id/toggle", requireAdmin, async (req, res) => {
    const { ativo } = req.body;
    const sub = await storage.toggleNewsletterSubscriber(req.params.id, ativo);
    if (!sub) return res.status(404).json({ message: "Inscrito não encontrado" });
    res.json(sub);
  });

  app.delete("/api/admin/newsletter/:id", requireAdmin, async (req, res) => {
    await storage.deleteNewsletterSubscriber(req.params.id);
    res.json({ message: "Inscrito removido" });
  });

  // ══════════════════════════════════════════════════════════
  // FINANCEIRO
  // ══════════════════════════════════════════════════════════

  // Accounts
  app.get("/api/admin/financeiro/contas", requireAdmin, async (_req, res) => {
    res.json(await storage.getFinancialAccounts());
  });
  app.post("/api/admin/financeiro/contas", requireAdmin, async (req, res) => {
    const parsed = insertFinancialAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message });
    res.json(await storage.createFinancialAccount(parsed.data));
  });
  app.patch("/api/admin/financeiro/contas/:id", requireAdmin, async (req, res) => {
    const row = await storage.updateFinancialAccount(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: "Conta não encontrada" });
    res.json(row);
  });
  app.delete("/api/admin/financeiro/contas/:id", requireAdmin, async (req, res) => {
    await storage.deleteFinancialAccount(req.params.id);
    res.json({ message: "Conta removida" });
  });

  // Categories
  app.get("/api/admin/financeiro/categorias", requireAdmin, async (_req, res) => {
    res.json(await storage.getFinancialCategories());
  });
  app.post("/api/admin/financeiro/categorias", requireAdmin, async (req, res) => {
    const parsed = insertFinancialCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message });
    res.json(await storage.createFinancialCategory(parsed.data));
  });
  app.patch("/api/admin/financeiro/categorias/:id", requireAdmin, async (req, res) => {
    const row = await storage.updateFinancialCategory(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: "Categoria não encontrada" });
    res.json(row);
  });
  app.delete("/api/admin/financeiro/categorias/:id", requireAdmin, async (req, res) => {
    await storage.deleteFinancialCategory(req.params.id);
    res.json({ message: "Categoria removida" });
  });

  // Projects
  app.get("/api/admin/financeiro/projetos", requireAdmin, async (_req, res) => {
    res.json(await storage.getFinancialProjects());
  });
  app.post("/api/admin/financeiro/projetos", requireAdmin, async (req, res) => {
    const parsed = insertFinancialProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message });
    res.json(await storage.createFinancialProject(parsed.data));
  });
  app.patch("/api/admin/financeiro/projetos/:id", requireAdmin, async (req, res) => {
    const row = await storage.updateFinancialProject(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: "Projeto não encontrado" });
    res.json(row);
  });
  app.delete("/api/admin/financeiro/projetos/:id", requireAdmin, async (req, res) => {
    await storage.deleteFinancialProject(req.params.id);
    res.json({ message: "Projeto removido" });
  });

  // Transactions
  app.get("/api/admin/financeiro/transacoes", requireAdmin, async (_req, res) => {
    res.json(await storage.getFinancialTransactions());
  });
  app.post("/api/admin/financeiro/transacoes", requireAdmin, async (req, res) => {
    const parsed = insertFinancialTransactionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message });
    res.json(await storage.createFinancialTransaction(parsed.data));
  });
  app.patch("/api/admin/financeiro/transacoes/:id", requireAdmin, async (req, res) => {
    const row = await storage.updateFinancialTransaction(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: "Transação não encontrada" });
    res.json(row);
  });
  app.delete("/api/admin/financeiro/transacoes/:id", requireAdmin, async (req, res) => {
    await storage.deleteFinancialTransaction(req.params.id);
    res.json({ message: "Transação removida" });
  });

  // Reports
  app.get("/api/admin/financeiro/relatorios/resumo", requireAdmin, async (_req, res) => {
    const txs = await storage.getFinancialTransactions();
    const pagos = txs.filter(t => t.status === 'pago');
    const totalReceitas = pagos.filter(t => t.tipo === 'receita').reduce((s, t) => s + parseFloat(t.valor || '0'), 0);
    const totalDespesas = pagos.filter(t => t.tipo === 'despesa').reduce((s, t) => s + parseFloat(t.valor || '0'), 0);
    const custosFixos = pagos.filter(t => t.tipo === 'despesa' && t.tipoCusto === 'fixo').reduce((s, t) => s + parseFloat(t.valor || '0'), 0);
    const custosVariaveis = pagos.filter(t => t.tipo === 'despesa' && t.tipoCusto === 'variavel').reduce((s, t) => s + parseFloat(t.valor || '0'), 0);
    res.json({ totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas, custosFixos, custosVariaveis });
  });

  app.get("/api/admin/financeiro/relatorios/por-categoria", requireAdmin, async (_req, res) => {
    const txs = await storage.getFinancialTransactions();
    const cats = await storage.getFinancialCategories();
    const catMap = new Map(cats.map(c => [c.id, c.nome]));
    const result: Record<string, { receitas: number; despesas: number }> = {};
    for (const t of txs.filter(t => t.status === 'pago' && t.categoriaId)) {
      const nome = catMap.get(t.categoriaId!) || 'Sem categoria';
      if (!result[nome]) result[nome] = { receitas: 0, despesas: 0 };
      const val = parseFloat(t.valor || '0');
      if (t.tipo === 'receita') result[nome].receitas += val;
      else result[nome].despesas += val;
    }
    res.json(Object.entries(result).map(([categoria, vals]) => ({ categoria, ...vals })));
  });

  // Public transparency
  app.get("/api/public/financeiro/transparencia", async (_req, res) => {
    const txs = await storage.getFinancialTransactions();
    const publicas = txs.filter(t => t.isPublic && t.status === 'pago');
    res.json(publicas);
  });

  const httpServer = createServer(app);
  return httpServer;
}
