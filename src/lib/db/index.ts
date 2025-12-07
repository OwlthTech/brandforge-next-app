import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { join } from "path";

/**
 * SQLite database path - stored in ./data directory
 */
const dbPath = process.env.DATABASE_URL || join(process.cwd(), "data", "brandforge.db");

/**
 * Initialize SQLite database connection
 */
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

/**
 * Drizzle ORM instance with schema
 */
export const db = drizzle(sqlite, { schema });

/**
 * Close database connection (useful for cleanup in tests)
 */
export const closeDb = () => {
  sqlite.close();
};

export default db;
