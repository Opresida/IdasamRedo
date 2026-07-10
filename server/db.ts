
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Prefere NEON_DATABASE_URL quando existir (no Replit, o Postgres embutido "toma" o
// nome DATABASE_URL apontando pro banco `helium` vazio; o banco real do IDASAM fica
// no secret NEON_DATABASE_URL). Localmente só existe DATABASE_URL (=Neon), então cai nele.
const DATABASE_URL = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL (ou NEON_DATABASE_URL) must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
