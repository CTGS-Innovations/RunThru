import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  path: process.env.DATABASE_PATH || path.join(__dirname, '../../database/runthru.db'),
  // Only log SQL queries if LOG_LEVEL=debug (not just development mode)
  verbose: process.env.LOG_LEVEL === 'debug',
};
