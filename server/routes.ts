import { type Express } from "express";
import { db } from "./db";
import { users } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Placeholder endpoint - ready for new implementation
  app.get("/api/test", async (req, res) => {
    try {
      // Test database connection
      const result = await db.select().from(users).limit(1);
      res.json({ message: "Database connected successfully", userCount: result.length });
    } catch (error) {
      res.status(500).json({ error: "Database connection failed" });
    }
  });

  return app;
}