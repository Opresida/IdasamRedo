import { users, courses, enrollments, certificates, contactSubmissions, courseNotificationSubscriptions, articleCategories, articles, articleComments, articleReactions, type User, type InsertUser, type Course, type InsertCourse, type Enrollment, type InsertEnrollment, type Certificate, type InsertCertificate, type ContactSubmission, type InsertContactSubmission, type CourseNotificationSubscription, type InsertCourseNotificationSubscription, type ArticleCategory, type InsertArticleCategory, type Article, type InsertArticle, type UpdateArticle, type ArticleComment, type InsertArticleComment } from "@shared/schema";
import { db } from "./db";
import { eq, or, inArray, desc, isNull, and } from "drizzle-orm";

function generateAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IDASAM-${suffix}`;
}

export function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function normalizeIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  return trimmed.replace(/\D/g, "");
}

function isName(identifier: string): boolean {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return false;
  if (/\d{8,}/.test(trimmed)) return false;
  return /[a-zA-ZÀ-ÿ]/.test(trimmed);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCourseByAuthCode(code: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;
  backfillAuthCodes(): Promise<void>;
  saveCertConfig(courseId: string, certTemplate: string, certBlockConfig: string): Promise<Course | undefined>;
  getCertConfig(courseId: string): Promise<{ certTemplate: string | null; certBlockConfig: string | null } | undefined>;

  getEnrollments(): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getEnrollmentByIdentifier(identifier: string): Promise<Enrollment[]>;
  findEnrollmentDuplicate(courseId: string, cpf?: string | null, email?: string | null): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: string): Promise<void>;

  getCertificate(enrollmentId: string): Promise<Certificate | undefined>;
  getCertificatesByEnrollmentIds(enrollmentIds: string[]): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(enrollmentId: string, fileData: string): Promise<Certificate>;
  deleteOrphanedCertificates(): Promise<void>;

  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  createCourseNotificationSubscription(sub: InsertCourseNotificationSubscription): Promise<CourseNotificationSubscription>;
  getCourseNotificationSubscriptions(): Promise<CourseNotificationSubscription[]>;

  getArticleCategories(): Promise<ArticleCategory[]>;
  getArticleCategory(id: string): Promise<ArticleCategory | undefined>;
  createArticleCategory(category: InsertArticleCategory): Promise<ArticleCategory>;
  updateArticleCategory(id: string, category: Partial<InsertArticleCategory>): Promise<ArticleCategory | undefined>;
  deleteArticleCategory(id: string): Promise<void>;

  getArticles(publishedOnly?: boolean): Promise<(Article & { categoryName?: string | null })[]>;
  getArticle(id: string): Promise<(Article & { categoryName?: string | null }) | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: UpdateArticle): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<void>;
  incrementArticleViews(id: string): Promise<void>;

  getArticleComments(articleId: string, approvedOnly?: boolean): Promise<ArticleComment[]>;
  getAllComments(): Promise<(ArticleComment & { articleTitle?: string | null })[]>;
  createArticleComment(comment: InsertArticleComment): Promise<ArticleComment>;
  approveArticleComment(id: string): Promise<ArticleComment | undefined>;
  deleteArticleComment(id: string): Promise<void>;

  getArticleReactions(articleId: string): Promise<Record<string, number>>;
  toggleArticleReaction(articleId: string, anonymousUserId: string, reactionType: string): Promise<{ added: boolean }>;
  getUserArticleReactions(articleId: string, anonymousUserId: string): Promise<string[]>;

  migrateEnrollmentNamesToTitleCase(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getCourseByAuthCode(code: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.authCode, code.toUpperCase()));
    return course || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const authCode = generateAuthCode();
      try {
        const [created] = await db.insert(courses).values({ ...course, authCode }).returning();
        return created;
      } catch (err: any) {
        if (err?.code === "23505") continue;
        throw err;
      }
    }
    throw new Error("Failed to generate a unique auth code after 10 attempts");
  }

  async saveCertConfig(courseId: string, certTemplate: string, certBlockConfig: string): Promise<Course | undefined> {
    const [updated] = await db
      .update(courses)
      .set({ certTemplate, certBlockConfig })
      .where(eq(courses.id, courseId))
      .returning();
    return updated || undefined;
  }

  async getCertConfig(courseId: string): Promise<{ certTemplate: string | null; certBlockConfig: string | null } | undefined> {
    const [course] = await db
      .select({ certTemplate: courses.certTemplate, certBlockConfig: courses.certBlockConfig })
      .from(courses)
      .where(eq(courses.id, courseId));
    return course || undefined;
  }

  async backfillAuthCodes(): Promise<void> {
    const withoutCode = await db.select().from(courses).where(isNull(courses.authCode));
    for (const c of withoutCode) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const authCode = generateAuthCode();
        try {
          await db.update(courses).set({ authCode }).where(eq(courses.id, c.id));
          break;
        } catch (err: any) {
          if (err?.code === "23505") continue;
          throw err;
        }
      }
    }
    if (withoutCode.length > 0) {
      console.log(`Auth codes backfilled for ${withoutCode.length} course(s).`);
    }
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db
      .update(courses)
      .set(course)
      .where(eq(courses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCourse(id: string): Promise<void> {
    const courseEnrollments = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(eq(enrollments.courseId, id));

    if (courseEnrollments.length > 0) {
      const enrollmentIds = courseEnrollments.map((e) => e.id);
      await db.delete(certificates).where(inArray(certificates.enrollmentId, enrollmentIds));
      await db.delete(enrollments).where(eq(enrollments.courseId, id));
    }

    await db.delete(courses).where(eq(courses.id, id));
  }

  async getEnrollments(): Promise<Enrollment[]> {
    return db.select().from(enrollments);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }

  async getEnrollmentByIdentifier(identifier: string): Promise<Enrollment[]> {
    const all = await db.select().from(enrollments);

    if (isName(identifier)) {
      const normalizedInput = normalizeName(identifier);
      return all.filter((e) => normalizeName(e.fullName ?? '') === normalizedInput);
    }

    const normalized = normalizeIdentifier(identifier);
    return all.filter(
      (e) => normalizeIdentifier(e.cpf ?? '') === normalized || normalizeIdentifier(e.email ?? '') === normalized
    );
  }

  async findEnrollmentDuplicate(courseId: string, cpf?: string | null, email?: string | null): Promise<Enrollment | undefined> {
    const normalizedCpf = cpf ? normalizeIdentifier(cpf) : null;
    const normalizedEmail = email ? normalizeIdentifier(email) : null;
    const hasCpf = !!(normalizedCpf && normalizedCpf.length > 0);
    const hasEmail = !!(normalizedEmail && normalizedEmail.length > 0);
    if (!hasCpf && !hasEmail) return undefined;
    const conditions = [];
    if (hasCpf) conditions.push(eq(enrollments.cpf, normalizedCpf!));
    if (hasEmail) conditions.push(eq(enrollments.email, normalizedEmail!));
    const candidates = await db.select().from(enrollments).where(
      and(eq(enrollments.courseId, courseId), or(...conditions))
    );
    return candidates.find((e) => {
      if (hasCpf) {
        const eCpf = e.cpf ? normalizeIdentifier(e.cpf) : null;
        if (eCpf && eCpf === normalizedCpf) return true;
      }
      if (hasEmail) {
        const eEmail = e.email ? normalizeIdentifier(e.email) : null;
        if (eEmail && eEmail === normalizedEmail) return true;
      }
      return false;
    });
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const duplicate = await this.findEnrollmentDuplicate(enrollment.courseId, enrollment.cpf, enrollment.email);
    if (duplicate) {
      throw new Error("DUPLICATE_ENROLLMENT");
    }
    const normalizedEnrollment = {
      ...enrollment,
      fullName: enrollment.fullName ? toTitleCase(enrollment.fullName) : enrollment.fullName,
    };
    const [created] = await db.insert(enrollments).values(normalizedEnrollment).returning();
    return created;
  }

  async updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const normalized = {
      ...enrollment,
      ...(enrollment.fullName !== undefined
        ? { fullName: enrollment.fullName ? toTitleCase(enrollment.fullName) : enrollment.fullName }
        : {}),
    };
    const [updated] = await db
      .update(enrollments)
      .set(normalized)
      .where(eq(enrollments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEnrollment(id: string): Promise<void> {
    await db.delete(certificates).where(eq(certificates.enrollmentId, id));
    await db.delete(enrollments).where(eq(enrollments.id, id));
  }

  async getCertificate(enrollmentId: string): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.enrollmentId, enrollmentId));
    return cert || undefined;
  }

  async getCertificatesByEnrollmentIds(enrollmentIds: string[]): Promise<Certificate[]> {
    if (enrollmentIds.length === 0) return [];
    return db.select().from(certificates).where(inArray(certificates.enrollmentId, enrollmentIds));
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [created] = await db.insert(certificates).values(certificate).returning();
    return created;
  }

  async updateCertificate(enrollmentId: string, fileData: string): Promise<Certificate> {
    const existing = await this.getCertificate(enrollmentId);
    if (existing) {
      const [updated] = await db
        .update(certificates)
        .set({ fileData, filePath: null })
        .where(eq(certificates.enrollmentId, enrollmentId))
        .returning();
      return updated;
    } else {
      return this.createCertificate({ enrollmentId, fileData });
    }
  }

  async deleteOrphanedCertificates(): Promise<void> {
    const allCerts = await db.select().from(certificates);
    const orphaned = allCerts.filter((c) => !c.fileData && c.filePath);
    for (const cert of orphaned) {
      await db.delete(certificates).where(eq(certificates.id, cert.id));
    }
    if (orphaned.length > 0) {
      console.log(`Deleted ${orphaned.length} orphaned certificate(s) with disk-only file paths.`);
    }
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(submission).returning();
    return created;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async createCourseNotificationSubscription(sub: InsertCourseNotificationSubscription): Promise<CourseNotificationSubscription> {
    const [created] = await db.insert(courseNotificationSubscriptions).values(sub).returning();
    return created;
  }

  async getCourseNotificationSubscriptions(): Promise<CourseNotificationSubscription[]> {
    return db.select().from(courseNotificationSubscriptions).orderBy(desc(courseNotificationSubscriptions.createdAt));
  }

  async getArticleCategories(): Promise<ArticleCategory[]> {
    return db.select().from(articleCategories).orderBy(articleCategories.name);
  }

  async getArticleCategory(id: string): Promise<ArticleCategory | undefined> {
    const [cat] = await db.select().from(articleCategories).where(eq(articleCategories.id, id));
    return cat || undefined;
  }

  async createArticleCategory(category: InsertArticleCategory): Promise<ArticleCategory> {
    const [created] = await db.insert(articleCategories).values(category).returning();
    return created;
  }

  async updateArticleCategory(id: string, category: Partial<InsertArticleCategory>): Promise<ArticleCategory | undefined> {
    const [updated] = await db.update(articleCategories).set(category).where(eq(articleCategories.id, id)).returning();
    return updated || undefined;
  }

  async deleteArticleCategory(id: string): Promise<void> {
    await db.delete(articleCategories).where(eq(articleCategories.id, id));
  }

  async getArticles(publishedOnly = false): Promise<(Article & { categoryName?: string | null })[]> {
    const rows = await db.select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      excerpt: articles.excerpt,
      image: articles.image,
      categoryId: articles.categoryId,
      authorName: articles.authorName,
      tags: articles.tags,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      readingTime: articles.readingTime,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      categoryName: articleCategories.name,
    })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .orderBy(desc(articles.createdAt));

    if (publishedOnly) {
      return rows.filter(r => r.published === "true");
    }
    return rows;
  }

  async getArticle(id: string): Promise<(Article & { categoryName?: string | null }) | undefined> {
    const [row] = await db.select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      excerpt: articles.excerpt,
      image: articles.image,
      categoryId: articles.categoryId,
      authorName: articles.authorName,
      tags: articles.tags,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      readingTime: articles.readingTime,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      categoryName: articleCategories.name,
    })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(eq(articles.id, id));
    return row || undefined;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async updateArticle(id: string, article: UpdateArticle): Promise<Article | undefined> {
    const [updated] = await db.update(articles).set({ ...article, updatedAt: new Date() }).where(eq(articles.id, id)).returning();
    return updated || undefined;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articleComments).where(eq(articleComments.articleId, id));
    await db.delete(articleReactions).where(eq(articleReactions.articleId, id));
    await db.delete(articles).where(eq(articles.id, id));
  }

  async incrementArticleViews(id: string): Promise<void> {
    const [art] = await db.select({ views: articles.views }).from(articles).where(eq(articles.id, id));
    if (art) {
      await db.update(articles).set({ views: art.views + 1 }).where(eq(articles.id, id));
    }
  }

  async getArticleComments(articleId: string, approvedOnly = false): Promise<ArticleComment[]> {
    const where = approvedOnly
      ? and(eq(articleComments.articleId, articleId), eq(articleComments.isApproved, "true"))
      : eq(articleComments.articleId, articleId);
    return db.select().from(articleComments).where(where).orderBy(desc(articleComments.createdAt));
  }

  async getAllComments(): Promise<(ArticleComment & { articleTitle?: string | null })[]> {
    const rows = await db.select({
      id: articleComments.id,
      articleId: articleComments.articleId,
      parentCommentId: articleComments.parentCommentId,
      authorName: articleComments.authorName,
      authorEmail: articleComments.authorEmail,
      content: articleComments.content,
      isApproved: articleComments.isApproved,
      reactionCounts: articleComments.reactionCounts,
      createdAt: articleComments.createdAt,
      articleTitle: articles.title,
    })
      .from(articleComments)
      .leftJoin(articles, eq(articleComments.articleId, articles.id))
      .orderBy(desc(articleComments.createdAt));
    return rows;
  }

  async createArticleComment(comment: InsertArticleComment): Promise<ArticleComment> {
    const [created] = await db.insert(articleComments).values(comment).returning();
    return created;
  }

  async approveArticleComment(id: string): Promise<ArticleComment | undefined> {
    const [updated] = await db.update(articleComments).set({ isApproved: "true" }).where(eq(articleComments.id, id)).returning();
    return updated || undefined;
  }

  async deleteArticleComment(id: string): Promise<void> {
    await db.delete(articleComments).where(eq(articleComments.id, id));
  }

  async getArticleReactions(articleId: string): Promise<Record<string, number>> {
    const rows = await db.select({ reactionType: articleReactions.reactionType }).from(articleReactions).where(eq(articleReactions.articleId, articleId));
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.reactionType] = (counts[row.reactionType] || 0) + 1;
    }
    return counts;
  }

  async toggleArticleReaction(articleId: string, anonymousUserId: string, reactionType: string): Promise<{ added: boolean }> {
    const [existing] = await db.select().from(articleReactions).where(
      and(
        eq(articleReactions.articleId, articleId),
        eq(articleReactions.anonymousUserId, anonymousUserId),
        eq(articleReactions.reactionType, reactionType)
      )
    );
    if (existing) {
      await db.delete(articleReactions).where(eq(articleReactions.id, existing.id));
      return { added: false };
    } else {
      await db.insert(articleReactions).values({ articleId, anonymousUserId, reactionType });
      return { added: true };
    }
  }

  async getUserArticleReactions(articleId: string, anonymousUserId: string): Promise<string[]> {
    const rows = await db.select({ reactionType: articleReactions.reactionType }).from(articleReactions).where(
      and(eq(articleReactions.articleId, articleId), eq(articleReactions.anonymousUserId, anonymousUserId))
    );
    return rows.map(r => r.reactionType);
  }

  async migrateEnrollmentNamesToTitleCase(): Promise<number> {
    const all = await db.select({ id: enrollments.id, fullName: enrollments.fullName }).from(enrollments);
    let updated = 0;
    for (const e of all) {
      if (!e.fullName) continue;
      const titleCased = toTitleCase(e.fullName);
      if (titleCased !== e.fullName) {
        await db.update(enrollments).set({ fullName: titleCased }).where(eq(enrollments.id, e.id));
        updated++;
      }
    }
    return updated;
  }
}

export const storage = new DatabaseStorage();
