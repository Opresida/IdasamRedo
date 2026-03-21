import { users, courses, enrollments, certificates, contactSubmissions, type User, type InsertUser, type Course, type InsertCourse, type Enrollment, type InsertEnrollment, type Certificate, type InsertCertificate, type ContactSubmission, type InsertContactSubmission } from "@shared/schema";
import { db } from "./db";
import { eq, or, inArray, desc, isNull } from "drizzle-orm";

function generateAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IDASAM-${suffix}`;
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

  getEnrollments(): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getEnrollmentByIdentifier(identifier: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: string): Promise<void>;

  getCertificate(enrollmentId: string): Promise<Certificate | undefined>;
  getCertificatesByEnrollmentIds(enrollmentIds: string[]): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(enrollmentId: string, filePath: string): Promise<Certificate>;

  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
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
      return all.filter((e) => normalizeName(e.fullName) === normalizedInput);
    }

    const normalized = normalizeIdentifier(identifier);
    return all.filter(
      (e) => normalizeIdentifier(e.cpf) === normalized || normalizeIdentifier(e.email) === normalized
    );
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [created] = await db.insert(enrollments).values(enrollment).returning();
    return created;
  }

  async updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const [updated] = await db
      .update(enrollments)
      .set(enrollment)
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

  async updateCertificate(enrollmentId: string, filePath: string): Promise<Certificate> {
    const existing = await this.getCertificate(enrollmentId);
    if (existing) {
      const [updated] = await db
        .update(certificates)
        .set({ filePath })
        .where(eq(certificates.enrollmentId, enrollmentId))
        .returning();
      return updated;
    } else {
      return this.createCertificate({ enrollmentId, filePath });
    }
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(submission).returning();
    return created;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }
}

export const storage = new DatabaseStorage();
