import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  path: process.env.DATABASE_PATH || path.join(__dirname, '../../database/runthru.db'),
  verbose: process.env.NODE_ENV === 'development',
};
