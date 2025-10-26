import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { initializeDatabase } from './services/database.service';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (debug level - quiet by default)
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Serve static files (character portraits and audio)
app.use('/portraits', express.static('public/portraits'));
app.use('/audio', express.static('public/audio'));

// Routes
app.use('/api', routes);

// Error handling (must be last)
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    // Initialize SQLite database
    await initializeDatabase();
    logger.info('Database initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`RunThru Backend API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`TTS Service: ${process.env.TTS_SERVICE_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
