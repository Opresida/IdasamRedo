
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, integer, unique } from "drizzle-orm/pg-core";
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
