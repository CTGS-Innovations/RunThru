import winston from 'winston';

// Detect if output is a terminal (prevents color codes in pipes/logs)
const isTerminal = process.stdout.isTTY;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'warn',  // Default to warnings/errors only
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        // Only colorize if output is a terminal
        isTerminal ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ],
  // Prevent crashes from logger errors
  exitOnError: false,
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Reset terminal colors before exit
  process.stdout.write('\x1b[0m');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

export default logger;
