import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
import { type Express } from "express";
import { db } from "@/server/db";
import { articles, categories, comments, transactions, bankAccounts, suppliers, donors } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const data = await db.select().from(articles).orderBy(articles.createdAt);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const [article] = await db.insert(articles).values(req.body).returning();
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const data = await db.select().from(categories);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Comments routes
  app.get("/api/comments", async (req, res) => {
    try {
      let query = db.select().from(comments);
      
      if (req.query.articleId) {
        query = query.where(eq(comments.articleId, parseInt(req.query.articleId as string)));
      }
      
      const data = await query.orderBy(comments.createdAt);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Financial routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const data = await db.select().from(transactions).orderBy(transactions.date);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/bank-accounts", async (req, res) => {
    try {
      const data = await db.select().from(bankAccounts);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank accounts" });
    }
  });

  app.get("/api/suppliers", async (req, res) => {
    try {
      const data = await db.select().from(suppliers);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/donors", async (req, res) => {
    try {
      const data = await db.select().from(donors);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donors" });
    }
  });

  // Statistics route
  app.get("/api/statistics", async (req, res) => {
    try {
      const [articleCount] = await db.select({ count: articles.id }).from(articles);
      const [commentCount] = await db.select({ count: comments.id }).from(comments);
      
      res.json({
        total_articles: articleCount?.count || 0,
        total_comments: commentCount?.count || 0,
        total_views: 0, // Mock data
        engagement_rate: 0 // Mock data
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  return app;
}
