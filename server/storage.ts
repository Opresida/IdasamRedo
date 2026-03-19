import { users, courses, enrollments, certificates, type User, type InsertUser, type Course, type InsertCourse, type Enrollment, type InsertEnrollment, type Certificate, type InsertCertificate } from "@shared/schema";
import { db } from "./db";
import { eq, or, inArray } from "drizzle-orm";

export function normalizeIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  return trimmed.replace(/\D/g, "");
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;

  getEnrollments(): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getEnrollmentByIdentifier(identifier: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;

  getCertificate(enrollmentId: string): Promise<Certificate | undefined>;
  getCertificatesByEnrollmentIds(enrollmentIds: string[]): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(enrollmentId: string, filePath: string): Promise<Certificate>;
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

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async getEnrollments(): Promise<Enrollment[]> {
    return db.select().from(enrollments);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }

  async getEnrollmentByIdentifier(identifier: string): Promise<Enrollment[]> {
    const normalized = normalizeIdentifier(identifier);
    const all = await db.select().from(enrollments);
    return all.filter(
      (e) => normalizeIdentifier(e.cpf) === normalized || normalizeIdentifier(e.email) === normalized
    );
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [created] = await db.insert(enrollments).values(enrollment).returning();
    return created;
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
}

export const storage = new DatabaseStorage();
