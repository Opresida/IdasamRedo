import { type Express, type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";
import { insertEnrollmentSchema, insertCourseSchema, insertContactSubmissionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import crypto from "crypto";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
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

const adminSessions = new Map<string, { email: string; expiresAt: number }>();

function createAdminSession(email: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  adminSessions.set(token, { email, expiresAt });
  return token;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }
  const token = authHeader.slice(7);
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    adminSessions.delete(token);
    return res.status(401).json({ message: "Sessão expirada ou inválida" });
  }
  next();
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
  },
  {
    title: "Transformação Digital",
    description: "Estratégias e ferramentas para a transformação digital de organizações: cultura, tecnologia, processos e modelos de negócios na era digital.",
    instructor: "Prof. Alexandre Souza",
    workload: 20,
    startDate: "2026-03-09",
    endDate: "2026-03-13",
    location: "Manaus – AM (Presencial)",
  },
  {
    title: "Lean Manufacturing aplicada à Indústria 4.0",
    description: "Princípios do Lean Manufacturing integrados às tecnologias da Indústria 4.0: eliminação de desperdícios, eficiência operacional e digitalização de processos.",
    instructor: "Prof. Gilson Lira",
    workload: 20,
    startDate: "2026-03-16",
    endDate: "2026-03-18",
    location: "Manaus – AM (Presencial)",
  },
  {
    title: "Inovação Tecnológica na Indústria",
    description: "Metodologias de inovação, desenvolvimento de novos produtos e serviços, gestão da propriedade intelectual e ecossistemas de inovação industrial.",
    instructor: "Profa. Fabiana Oliveira",
    workload: 20,
    startDate: "2026-03-19",
    endDate: "2026-03-20",
    location: "Manaus – AM (Presencial)",
  },
  {
    title: "Processos avaliativos da maturidade da indústria 4.0",
    description: "Modelos e ferramentas para avaliar o nível de maturidade digital das organizações, diagnóstico estratégico e roteiro de implementação da Indústria 4.0.",
    instructor: "Prof. Alexandre Souza",
    workload: 20,
    startDate: "2026-03-23",
    endDate: "2026-03-27",
    location: "Manaus – AM (Presencial)",
  },
  {
    title: "Logística e Cadeia de Suprimentos",
    description: "Gestão integrada da cadeia de suprimentos, logística reversa, rastreabilidade, tecnologias emergentes e sustentabilidade na cadeia logística.",
    instructor: "Prof. Américo Minori",
    workload: 20,
    startDate: "2026-03-30",
    endDate: "2026-03-31",
    location: "Manaus – AM (Presencial)",
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

export async function registerRoutes(app: Express) {
  await seedCourses();

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
    }
    const validPassword = ADMIN_CREDENTIALS[email as string];
    if (!validPassword || validPassword !== password) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    const token = createAdminSession(email);
    res.json({ token, email });
  });

  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      adminSessions.delete(authHeader.slice(7));
    }
    res.json({ message: "Sessão encerrada" });
  });

  app.get("/api/admin/verify", requireAdmin, (_req, res) => {
    res.json({ valid: true });
  });

  app.get("/api/courses", async (_req, res) => {
    try {
      const all = await storage.getCourses();
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar cursos" });
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
      const parsed = insertCourseSchema.partial().safeParse(req.body);
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
      const enrollment = await storage.createEnrollment(parsed.data);
      res.status(201).json(enrollment);
    } catch (err) {
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
      for (let i = 0; i < records.length; i++) {
        const parsed = insertEnrollmentSchema.safeParse({ ...records[i], courseId });
        if (!parsed.success) {
          errors.push({ row: i + 1, errors: parsed.error.errors });
          continue;
        }
        try {
          const enrollment = await storage.createEnrollment(parsed.data);
          created.push(enrollment);
        } catch (e) {
          errors.push({ row: i + 1, errors: [{ message: "Erro ao inserir" }] });
        }
      }
      res.status(201).json({ created: created.length, errors });
    } catch (err) {
      res.status(500).json({ message: "Erro ao importar inscrições" });
    }
  });

  app.get("/api/enrollments/course/:courseId", requireAdmin, async (req, res) => {
    try {
      const list = await storage.getEnrollmentsByCourse(req.params.courseId);
      const enrollmentIds = list.map((e) => e.id);
      const certs = await storage.getCertificatesByEnrollmentIds(enrollmentIds);
      const certSet = new Set(certs.map((c) => c.enrollmentId));
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
        return res.status(400).json({ message: "CPF ou e-mail é obrigatório" });
      }
      const enrolls = await storage.getEnrollmentByIdentifier(identifier.trim());
      if (enrolls.length === 0) {
        return res.status(404).json({ message: "Nenhuma inscrição encontrada" });
      }

      const result = await Promise.all(
        enrolls.map(async (e) => {
          const cert = await storage.getCertificate(e.id);
          const course = await storage.getCourse(e.courseId);
          return {
            enrollmentId: e.id,
            fullName: e.fullName,
            courseTitle: course?.title ?? "Curso",
            hasCertificate: !!cert,
          };
        })
      );

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Erro ao consultar certificado" });
    }
  });

  app.get("/api/certificates/download/:enrollmentId", async (req, res) => {
    try {
      const { identifier } = req.query;
      if (!identifier || typeof identifier !== "string" || identifier.trim() === "") {
        return res.status(400).json({ message: "CPF ou e-mail é obrigatório para baixar certificado" });
      }
      const enrollment = await storage.getEnrollmentByIdentifier(identifier.trim());
      const match = enrollment.find((e) => e.id === req.params.enrollmentId);
      if (!match) {
        return res.status(403).json({ message: "Não autorizado a baixar este certificado" });
      }
      const cert = await storage.getCertificate(req.params.enrollmentId);
      if (!cert) {
        return res.status(404).json({ message: "Certificado não encontrado" });
      }
      const filePath = path.join(process.cwd(), cert.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Arquivo do certificado não encontrado" });
      }
      res.download(filePath, "certificado.pdf");
    } catch (err) {
      res.status(500).json({ message: "Erro ao baixar certificado" });
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
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Inscrição não encontrada" });
      }
      const relPath = path.relative(process.cwd(), req.file.path);
      const cert = await storage.updateCertificate(req.params.enrollmentId, relPath);
      res.status(201).json(cert);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
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

  const httpServer = createServer(app);
  return httpServer;
}
