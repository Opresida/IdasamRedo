
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const COURSE_STATUSES = ['open', 'closed', 'coming_soon', 'completed'] as const;
export type CourseStatus = typeof COURSE_STATUSES[number];

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  workload: integer("workload").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  location: text("location").notNull(),
  schedule: text("schedule"),
  address: text("address"),
  curriculum: text("curriculum"),
  vacancies: integer("vacancies"),
  status: text("status").notNull().default("open"),
  authCode: text("auth_code").unique(),
  certTemplate: text("cert_template"),
  certBlockConfig: text("cert_block_config"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  authCode: true,
  createdAt: true,
}).extend({
  schedule: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  curriculum: z.string().optional().nullable(),
  vacancies: z.number().int().positive().optional().nullable(),
  status: z.enum(COURSE_STATUSES).optional().default('open'),
});

export const updateCourseSchema = insertCourseSchema.extend({
  status: z.enum(COURSE_STATUSES).optional(),
}).partial();

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type Course = typeof courses.$inferSelect;

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  fullName: text("full_name"),
  cpf: text("cpf"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
  certificates: many(certificates),
}));

export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id),
  filePath: text("file_path"),
  fileData: text("file_data"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  uploadedAt: true,
}).extend({
  filePath: z.string().optional().nullable(),
  fileData: z.string().optional().nullable(),
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

export const certificatesRelations = relations(certificates, ({ one }) => ({
  enrollment: one(enrollments, { fields: [certificates.enrollmentId], references: [enrollments.id] }),
}));

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull(),
  email: text("email").notNull(),
  organizacao: text("organizacao"),
  descricao: text("descricao").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
}).extend({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  organizacao: z.string().optional().nullable(),
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export const courseNotificationSubscriptions = pgTable("course_notification_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertCourseNotificationSubscriptionSchema = createInsertSchema(courseNotificationSubscriptions).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

export type InsertCourseNotificationSubscription = z.infer<typeof insertCourseNotificationSubscriptionSchema>;
export type CourseNotificationSubscription = typeof courseNotificationSubscriptions.$inferSelect;

// ── Newsletter Subscribers ──
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true, createdAt: true, ativo: true,
}).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export const articleCategories = pgTable("article_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertArticleCategorySchema = createInsertSchema(articleCategories).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  description: z.string().optional().nullable(),
});

export type InsertArticleCategory = z.infer<typeof insertArticleCategorySchema>;
export type ArticleCategory = typeof articleCategories.$inferSelect;

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  image: text("image"),
  categoryId: uuid("category_id").references(() => articleCategories.id),
  authorName: text("author_name").notNull().default("Admin"),
  tags: text("tags").array(),
  published: text("published").notNull().default("false"),
  featured: text("featured").notNull().default("false"),
  views: integer("views").notNull().default(0),
  readingTime: integer("reading_time").notNull().default(5),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  excerpt: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  authorName: z.string().optional().default("Admin"),
  tags: z.array(z.string()).optional().nullable(),
  published: z.string().optional().default("false"),
  featured: z.string().optional().default("false"),
  readingTime: z.number().int().positive().optional().default(5),
});

export const updateArticleSchema = insertArticleSchema.partial();

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const articleComments = pgTable("article_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: uuid("article_id").notNull().references(() => articles.id),
  parentCommentId: uuid("parent_comment_id"),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  isApproved: text("is_approved").notNull().default("false"),
  reactionCounts: text("reaction_counts").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertArticleCommentSchema = createInsertSchema(articleComments).omit({
  id: true,
  createdAt: true,
  isApproved: true,
  reactionCounts: true,
}).extend({
  articleId: z.string().min(1, "ID do artigo é obrigatório"),
  parentCommentId: z.string().optional().nullable(),
  authorName: z.string().min(1, "Nome é obrigatório"),
  authorEmail: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  content: z.string().min(1, "Comentário é obrigatório"),
});

export type InsertArticleComment = z.infer<typeof insertArticleCommentSchema>;
export type ArticleComment = typeof articleComments.$inferSelect;

export const articleReactions = pgTable("article_reactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: uuid("article_id").notNull().references(() => articles.id),
  anonymousUserId: text("anonymous_user_id").notNull(),
  reactionType: text("reaction_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const EMAIL_TRIGGER_TYPES = ['manual', 'course_signup', 'certificate_ready', 'course_notification'] as const;
export type EmailTriggerType = typeof EMAIL_TRIGGER_TYPES[number];

export const emailAudiences = pgTable("email_audiences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertEmailAudienceSchema = createInsertSchema(emailAudiences).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Nome é obrigatório"),
});
export type InsertEmailAudience = z.infer<typeof insertEmailAudienceSchema>;
export type EmailAudience = typeof emailAudiences.$inferSelect;

export const audienceLeads = pgTable("audience_leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  audienceId: uuid("audience_id").notNull().references(() => emailAudiences.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertAudienceLeadSchema = createInsertSchema(audienceLeads).omit({ id: true, createdAt: true }).extend({
  audienceId: z.string().min(1, "Audiência é obrigatória"),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});
export type InsertAudienceLead = z.infer<typeof insertAudienceLeadSchema>;
export type AudienceLead = typeof audienceLeads.$inferSelect;

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  trigger: text("trigger").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  body: z.string().min(1, "Corpo é obrigatório"),
  trigger: z.enum(EMAIL_TRIGGER_TYPES).default("manual"),
});
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export const emailCampaigns = pgTable("email_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  audienceId: uuid("audience_id").notNull().references(() => emailAudiences.id),
  templateId: uuid("template_id").references(() => emailTemplates.id),
  customHtmlTemplateId: uuid("custom_html_template_id"),
  sentAt: timestamp("sent_at", { withTimezone: true }).default(sql`NOW()`),
  sentCount: integer("sent_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  openCount: integer("open_count").notNull().default(0),
  subject: text("subject"),
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({ id: true, sentAt: true }).extend({
  audienceId: z.string().min(1, "Audiência é obrigatória"),
  templateId: z.string().optional().nullable(),
  customHtmlTemplateId: z.string().optional().nullable(),
  errorCount: z.number().optional(),
  openCount: z.number().optional(),
  subject: z.string().optional().nullable(),
});
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

export const customHtmlTemplates = pgTable("custom_html_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  htmlContent: text("html_content").notNull(),
  campaignIds: text("campaign_ids").array(),
  triggerType: text("trigger_type").default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertCustomHtmlTemplateSchema = createInsertSchema(customHtmlTemplates).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  htmlContent: z.string().min(1, "Conteúdo HTML é obrigatório"),
  campaignIds: z.array(z.string()).optional().nullable(),
  triggerType: z.enum(EMAIL_TRIGGER_TYPES).optional().default("manual"),
});
export type InsertCustomHtmlTemplate = z.infer<typeof insertCustomHtmlTemplateSchema>;
export type CustomHtmlTemplate = typeof customHtmlTemplates.$inferSelect;

export const campaignOpenEvents = pgTable("campaign_open_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => emailCampaigns.id, { onDelete: 'cascade' }),
  leadId: uuid("lead_id").notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).default(sql`NOW()`),
}, (t) => ({
  uniqueOpenPerLead: unique("unique_open_per_lead").on(t.campaignId, t.leadId),
}));

export const PROPOSAL_STATUSES = ['rascunho', 'enviada', 'aprovada', 'rejeitada', 'em_negociacao'] as const;
export type ProposalStatus = typeof PROPOSAL_STATUSES[number];

export const DOC_TIPOS = ['contrato', 'orcamento', 'oficio', 'relatorio', 'projeto'] as const;
export type DocTipo = typeof DOC_TIPOS[number];

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo: text("tipo").$type<DocTipo>().default("orcamento"),
  numero: text("numero").notNull(),
  titulo: text("titulo").notNull(),
  cliNome: text("cli_nome").notNull(),
  cliEmail: text("cli_email"),
  cliTel: text("cli_tel"),
  valorTotal: text("valor_total"),
  status: text("status").$type<ProposalStatus>().default("enviada"),
  emissao: text("emissao"),
  validade: text("validade"),
  dados: text("dados"),
  obs: text("obs"),
  pdfData: text("pdf_data"),
  pdfAssinado: text("pdf_assinado"),
  assinadoEm: timestamp("assinado_em", { withTimezone: true }),
  enviadoEm: timestamp("enviado_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, createdAt: true }).extend({
  tipo:       z.enum(DOC_TIPOS).optional().default("orcamento"),
  numero:     z.string().min(1, "Número é obrigatório"),
  titulo:     z.string().min(1, "Título é obrigatório"),
  cliNome:    z.string().min(1, "Nome é obrigatório"),
  valorTotal: z.string().optional().nullable(),
  status:     z.enum(PROPOSAL_STATUSES).optional().default("enviada"),
  pdfData:    z.string().optional().nullable(),
});
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// ── Signatários (assinantes internos cadastrados) ──
export const SIGNATARIO_ROLES = ['presidente', 'vice_presidente', 'diretor_administrativo', 'outro'] as const;
export type SignatarioRole = typeof SIGNATARIO_ROLES[number];

export const signatarios = pgTable("signatarios", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  cargo: text("cargo").notNull(),
  role: text("role").$type<SignatarioRole>().notNull().default("outro"),
  email: text("email").notNull(),
  ativo: text("ativo").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});
export const insertSignatarioSchema = createInsertSchema(signatarios).omit({ id: true, createdAt: true }).extend({
  nome:  z.string().min(1, "Nome é obrigatório"),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  role:  z.enum(SIGNATARIO_ROLES).optional().default("outro"),
  email: z.string().email("E-mail inválido"),
});
export type InsertSignatario = z.infer<typeof insertSignatarioSchema>;
export type Signatario = typeof signatarios.$inferSelect;

// ── Delegações de Poderes ──
export const DELEGACAO_STATUSES = ['ativa', 'revogada', 'expirada'] as const;
export type DelegacaoStatus = typeof DELEGACAO_STATUSES[number];

export const PODERES_DELEGAVEIS = ['assinar_contratos', 'assinar_orcamentos', 'assinar_oficios', 'assinar_relatorios', 'assinar_projetos'] as const;
export type PoderDelegavel = typeof PODERES_DELEGAVEIS[number];

export const delegacoes = pgTable("delegacoes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  numero: text("numero").notNull(),
  deleganteId: uuid("delegante_id").notNull(),
  delegadoId: uuid("delegado_id").notNull(),
  motivo: text("motivo").notNull(),
  poderes: text("poderes").notNull(), // JSON array de PoderDelegavel
  validaDe: timestamp("valida_de", { withTimezone: true }).notNull(),
  validaAte: timestamp("valida_ate", { withTimezone: true }).notNull(),
  status: text("status").$type<DelegacaoStatus>().notNull().default("ativa"),
  atoDesignacaoPdf: text("ato_designacao_pdf"),
  revogadoEm: timestamp("revogado_em", { withTimezone: true }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export type Delegacao = typeof delegacoes.$inferSelect;
export type InsertDelegacao = Omit<Delegacao, 'id' | 'criadoEm' | 'revogadoEm' | 'atoDesignacaoPdf'>;

// ── Links de assinatura externa ──
export const assinaturaLinks = pgTable("assinatura_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: uuid("proposal_id").notNull(),
  token: text("token").notNull().unique(),
  signerName: text("signer_name"),
  signerEmail: text("signer_email"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});
export type AssinaturaLink = typeof assinaturaLinks.$inferSelect;

// ── Audit trail de assinaturas ──
export const SIGNATURE_TYPES = ['internal', 'external'] as const;
export type SignatureType = typeof SIGNATURE_TYPES[number];

export const assinaturaLogs = pgTable("assinatura_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: uuid("proposal_id").notNull(),
  signerName: text("signer_name").notNull(),
  signerCpf: text("signer_cpf"),
  signerEmail: text("signer_email"),
  signerIp: text("signer_ip"),
  signerUserAgent: text("signer_user_agent"),
  signatureType: text("signature_type").$type<SignatureType>().notNull(),
  signatureImage: text("signature_image"),
  documentHash: text("document_hash").notNull(),
  signatarioId: uuid("signatario_id"),
  delegacaoId: uuid("delegacao_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`NOW()`),
});
export type AssinaturaLog = typeof assinaturaLogs.$inferSelect;
export type InsertAssinaturaLog = Omit<AssinaturaLog, 'id' | 'createdAt'>;

// ── Admin Sessions ──
export const adminSessions = pgTable("admin_sessions", {
  token: text("token").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
export type AdminSession = typeof adminSessions.$inferSelect;

// ══════════════════════════════════════════════════════════════
// CRM — Gestão de Stakeholders
// ══════════════════════════════════════════════════════════════

export const CRM_STAKEHOLDER_TYPES = ['pj', 'pf', 'doador', 'orgao_publico', 'pesquisador'] as const;
export type CrmStakeholderType = typeof CRM_STAKEHOLDER_TYPES[number];

export const CRM_STAKEHOLDER_STATUSES = ['ativo', 'inativo', 'pendente_lgpd'] as const;
export type CrmStakeholderStatus = typeof CRM_STAKEHOLDER_STATUSES[number];

export const crmStakeholders = pgTable("crm_stakeholders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo: text("tipo").$type<CrmStakeholderType>().notNull(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefone: text("telefone"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  observacoes: text("observacoes"),
  status: text("status").$type<CrmStakeholderStatus>().notNull().default("ativo"),
  tokenPublico: text("token_publico").unique(),
  lgpdConsentimento: boolean("lgpd_consentimento").notNull().default(false),
  lgpdConsentidoEm: timestamp("lgpd_consentido_em", { withTimezone: true }),
  lgpdIp: text("lgpd_ip"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).default(sql`NOW()`),
});

export const insertCrmStakeholderSchema = createInsertSchema(crmStakeholders).omit({
  id: true, criadoEm: true, atualizadoEm: true, tokenPublico: true,
}).extend({
  tipo: z.enum(CRM_STAKEHOLDER_TYPES),
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  status: z.enum(CRM_STAKEHOLDER_STATUSES).optional().default("ativo"),
  lgpdConsentimento: z.boolean().optional().default(false),
});
export type InsertCrmStakeholder = z.infer<typeof insertCrmStakeholderSchema>;
export type CrmStakeholder = typeof crmStakeholders.$inferSelect;

// ── Pessoa Jurídica ──
export const crmPessoaJuridica = pgTable("crm_pessoa_juridica", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  cnpj: text("cnpj").notNull(),
  razaoSocial: text("razao_social").notNull(),
  nomeFantasia: text("nome_fantasia"),
  inscricaoEstadual: text("inscricao_estadual"),
  inscricaoMunicipal: text("inscricao_municipal"),
  inscricaoSuframa: text("inscricao_suframa"),
  segmento: text("segmento"),
  porte: text("porte"),
  responsavelNome: text("responsavel_nome"),
  responsavelCargo: text("responsavel_cargo"),
  responsavelTelefone: text("responsavel_telefone"),
  responsavelEmail: text("responsavel_email"),
});
export type CrmPessoaJuridica = typeof crmPessoaJuridica.$inferSelect;

// ── Pessoa Física ──
export const crmPessoaFisica = pgTable("crm_pessoa_fisica", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  cpf: text("cpf").notNull(),
  rg: text("rg"),
  dataNascimento: text("data_nascimento"),
  profissao: text("profissao"),
  nacionalidade: text("nacionalidade"),
});
export type CrmPessoaFisica = typeof crmPessoaFisica.$inferSelect;

// ── Doador ──
export const CRM_DOADOR_TIPOS = ['pf', 'pj', 'internacional', 'fundo'] as const;
export type CrmDoadorTipo = typeof CRM_DOADOR_TIPOS[number];

export const crmDoador = pgTable("crm_doador", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  tipoDoador: text("tipo_doador").$type<CrmDoadorTipo>().notNull().default("pf"),
  cpfCnpj: text("cpf_cnpj"),
  areaInteresse: text("area_interesse"),
  recorrente: boolean("recorrente").notNull().default(false),
  valorMedioDoacao: text("valor_medio_doacao"),
  ultimaDoacao: timestamp("ultima_doacao", { withTimezone: true }),
});
export type CrmDoador = typeof crmDoador.$inferSelect;

// ── Órgão Público ──
export const CRM_ORGAO_ESFERAS = ['municipal', 'estadual', 'federal'] as const;
export type CrmOrgaoEsfera = typeof CRM_ORGAO_ESFERAS[number];

export const crmOrgaoPublico = pgTable("crm_orgao_publico", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  nomeOrgao: text("nome_orgao").notNull(),
  esfera: text("esfera").$type<CrmOrgaoEsfera>().notNull(),
  sigla: text("sigla"),
  setorResponsavel: text("setor_responsavel"),
  contatoNome: text("contato_nome"),
  contatoCargo: text("contato_cargo"),
  contatoTelefone: text("contato_telefone"),
  contatoEmail: text("contato_email"),
});
export type CrmOrgaoPublico = typeof crmOrgaoPublico.$inferSelect;

// ── Pesquisador ──
export const CRM_TITULACAO = ['graduacao', 'especializacao', 'mestrado', 'doutorado', 'pos_doutorado'] as const;
export type CrmTitulacao = typeof CRM_TITULACAO[number];

export const crmPesquisador = pgTable("crm_pesquisador", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  cpf: text("cpf"),
  lattes: text("lattes"),
  orcid: text("orcid"),
  instituicao: text("instituicao"),
  titulacao: text("titulacao").$type<CrmTitulacao>(),
  areaAtuacao: text("area_atuacao"),
  gruposPesquisa: text("grupos_pesquisa"),
});
export type CrmPesquisador = typeof crmPesquisador.$inferSelect;

// ── Documentos do CRM ──
export const crmDocumentos = pgTable("crm_documentos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull(),
  fileData: text("file_data").notNull(),
  tamanho: integer("tamanho"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export type CrmDocumento = typeof crmDocumentos.$inferSelect;

// ── Recibos do CRM (doações) ──
export const crmRecibos = pgTable("crm_recibos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  numero: text("numero").notNull(),
  valor: text("valor").notNull(),
  descricao: text("descricao").notNull(),
  dataEmissao: text("data_emissao").notNull(),
  pdfData: text("pdf_data"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export type CrmRecibo = typeof crmRecibos.$inferSelect;

// ── Interações do CRM ──
export const CRM_INTERACAO_TIPOS = ['email', 'telefone', 'reuniao', 'visita', 'documento', 'outro'] as const;
export type CrmInteracaoTipo = typeof CRM_INTERACAO_TIPOS[number];

export const crmInteracoes = pgTable("crm_interacoes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  tipo: text("tipo").$type<CrmInteracaoTipo>().notNull(),
  descricao: text("descricao").notNull(),
  data: timestamp("data", { withTimezone: true }).notNull().default(sql`NOW()`),
  responsavel: text("responsavel"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export type CrmInteracao = typeof crmInteracoes.$inferSelect;

// ── Dados Bancários do CRM ──
export const CRM_CONTA_TIPOS = ['corrente', 'poupanca', 'salario', 'pagamento'] as const;
export type CrmContaTipo = typeof CRM_CONTA_TIPOS[number];

export const CRM_PIX_TIPOS = ['cpf', 'cnpj', 'email', 'telefone', 'aleatoria'] as const;
export type CrmPixTipo = typeof CRM_PIX_TIPOS[number];

export const crmDadosBancarios = pgTable("crm_dados_bancarios", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeholderId: uuid("stakeholder_id").notNull().references(() => crmStakeholders.id, { onDelete: 'cascade' }),
  banco: text("banco").notNull(),
  codigoBanco: text("codigo_banco"),
  agencia: text("agencia").notNull(),
  conta: text("conta").notNull(),
  tipoConta: text("tipo_conta").$type<CrmContaTipo>().notNull().default("corrente"),
  titular: text("titular").notNull(),
  cpfCnpjTitular: text("cpf_cnpj_titular"),
  pixTipo: text("pix_tipo").$type<CrmPixTipo>(),
  pixChave: text("pix_chave"),
  principal: boolean("principal").notNull().default(false),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export type CrmDadosBancarios = typeof crmDadosBancarios.$inferSelect;

// ══════════════════════════════════════════════════════════════
// FINANCEIRO
// ══════════════════════════════════════════════════════════════

export const financialAccounts = pgTable("financial_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  banco: text("banco").notNull(),
  agencia: text("agencia").notNull(),
  conta: text("conta").notNull(),
  saldoInicial: text("saldo_inicial").notNull().default("0"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).default(sql`NOW()`),
});
export const insertFinancialAccountSchema = createInsertSchema(financialAccounts).omit({ id: true, criadoEm: true, atualizadoEm: true }).extend({
  nome: z.string().min(1), banco: z.string().min(1), agencia: z.string().min(1), conta: z.string().min(1),
});
export type InsertFinancialAccount = z.infer<typeof insertFinancialAccountSchema>;
export type FinancialAccount = typeof financialAccounts.$inferSelect;

export const FINANCIAL_CATEGORY_TYPES = ['receita', 'despesa', 'ambos'] as const;
export type FinancialCategoryType = typeof FINANCIAL_CATEGORY_TYPES[number];

export const financialCategories = pgTable("financial_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  tipo: text("tipo").$type<FinancialCategoryType>().notNull().default("ambos"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export const insertFinancialCategorySchema = createInsertSchema(financialCategories).omit({ id: true, criadoEm: true }).extend({
  nome: z.string().min(1),
  tipo: z.enum(FINANCIAL_CATEGORY_TYPES).optional().default("ambos"),
});
export type InsertFinancialCategory = z.infer<typeof insertFinancialCategorySchema>;
export type FinancialCategory = typeof financialCategories.$inferSelect;

export const PROJECT_CATEGORIES = ['Bioeconomia', 'Sustentabilidade', 'Saúde e Social', 'Capacitação'] as const;
export type ProjectCategory = typeof PROJECT_CATEGORIES[number];
export const PROJECT_STATUSES = ['planejamento', 'em_andamento', 'concluido'] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];
export const TRANSPARENCY_LEVELS = ['basico', 'detalhado', 'completo'] as const;
export type TransparencyLevel = typeof TRANSPARENCY_LEVELS[number];

export const financialProjects = pgTable("financial_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  descricaoCurta: text("descricao_curta"),
  descricaoCompleta: text("descricao_completa"),
  categoria: text("categoria").$type<ProjectCategory>(),
  imagemUrl: text("imagem_url"),
  status: text("status").$type<ProjectStatus>().default("planejamento"),
  orcamentoTotal: text("orcamento_total"),
  visivelSite: boolean("visivel_site").notNull().default(true),
  visivelTransparencia: boolean("visivel_transparencia").notNull().default(false),
  mostrarOrcamento: boolean("mostrar_orcamento").notNull().default(false),
  mostrarTransacoes: boolean("mostrar_transacoes").notNull().default(false),
  nivelTransparencia: text("nivel_transparencia").$type<TransparencyLevel>().default("basico"),
  pixKey: text("pix_key"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).default(sql`NOW()`),
});
export const insertFinancialProjectSchema = createInsertSchema(financialProjects).omit({ id: true, criadoEm: true, atualizadoEm: true }).extend({
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  descricaoCurta: z.string().optional().nullable(),
  descricaoCompleta: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  imagemUrl: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  orcamentoTotal: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
});
export type InsertFinancialProject = z.infer<typeof insertFinancialProjectSchema>;
export type FinancialProject = typeof financialProjects.$inferSelect;

export const FINANCIAL_TX_TYPES = ['receita', 'despesa'] as const;
export type FinancialTxType = typeof FINANCIAL_TX_TYPES[number];
export const FINANCIAL_TX_STATUSES = ['pendente', 'pago', 'a_vencer', 'cancelado'] as const;
export type FinancialTxStatus = typeof FINANCIAL_TX_STATUSES[number];
export const FINANCIAL_COST_TYPES = ['fixo', 'variavel'] as const;
export type FinancialCostType = typeof FINANCIAL_COST_TYPES[number];

export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo: text("tipo").$type<FinancialTxType>().notNull(),
  descricao: text("descricao").notNull(),
  valor: text("valor").notNull(),
  data: text("data").notNull(),
  contaId: uuid("conta_id").references(() => financialAccounts.id),
  categoriaId: uuid("categoria_id").references(() => financialCategories.id),
  projetoId: uuid("projeto_id").references(() => financialProjects.id),
  tipoCusto: text("tipo_custo").$type<FinancialCostType>(),
  fornecedorId: uuid("fornecedor_id").references(() => crmStakeholders.id, { onDelete: 'set null' }),
  doadorId: uuid("doador_id").references(() => crmStakeholders.id, { onDelete: 'set null' }),
  pesquisadorId: uuid("pesquisador_id").references(() => crmStakeholders.id, { onDelete: 'set null' }),
  status: text("status").$type<FinancialTxStatus>().notNull().default("pendente"),
  isPublic: boolean("is_public").notNull().default(false),
  documentoAnexo: text("documento_anexo"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).default(sql`NOW()`),
});
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, criadoEm: true, atualizadoEm: true }).extend({
  tipo: z.enum(FINANCIAL_TX_TYPES),
  descricao: z.string().min(1),
  valor: z.string().min(1),
  data: z.string().min(1),
  status: z.enum(FINANCIAL_TX_STATUSES).optional().default("pendente"),
});
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

// ══════════════════════════════════════════════════════════════
// PORTFÓLIO DE PROJETOS (pesquisa/catálogo)
// ══════════════════════════════════════════════════════════════

export const portfolioProjects = pgTable("portfolio_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: text("titulo").notNull(),
  descricaoCurta: text("descricao_curta").notNull(),
  descricaoCompleta: text("descricao_completa").notNull(),
  categoria: text("categoria").notNull(),
  icone: text("icone").notNull().default("default"),
  ativo: boolean("ativo").notNull().default(true),
  ordem: integer("ordem").notNull().default(0),
  criadoEm: timestamp("criado_em", { withTimezone: true }).default(sql`NOW()`),
});
export const insertPortfolioProjectSchema = createInsertSchema(portfolioProjects).omit({ id: true, criadoEm: true }).extend({
  titulo: z.string().min(1),
  descricaoCurta: z.string().min(1),
  descricaoCompleta: z.string().min(1),
  categoria: z.string().min(1),
  icone: z.string().optional().default("default"),
  ordem: z.number().optional().default(0),
});
export type InsertPortfolioProject = z.infer<typeof insertPortfolioProjectSchema>;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
