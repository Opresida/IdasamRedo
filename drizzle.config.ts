import { defineConfig } from "drizzle-kit";

// Mesma regra do server/db.ts: no Replit o banco real do IDASAM está em
// NEON_DATABASE_URL (o DATABASE_URL é o Postgres embutido `helium`, vazio).
// Assim o `drizzle-kit push` do build também migra o Neon certo.
const DATABASE_URL = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL (ou NEON_DATABASE_URL), ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
