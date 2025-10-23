import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { databaseConfig } from '../config/database';
import logger from '../utils/logger';

let db: Database.Database | null = null;

/**
 * Initialize SQLite database and create tables
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(databaseConfig.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database connection
    db = new Database(databaseConfig.path, {
      verbose: databaseConfig.verbose ? console.log : undefined,
    });

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}
