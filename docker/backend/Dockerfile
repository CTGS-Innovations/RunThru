# ==================================
# RunThru Backend Dockerfile
# Node.js 20 + Express + TypeScript
# ==================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --production=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm ci --production && npm cache clean --force

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies for better-sqlite3 and su-exec for entrypoint
RUN apk add --no-cache libstdc++ su-exec

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy entrypoint script (from backend directory in build context)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy built application and production dependencies
COPY --from=builder --chown=apiuser:nodejs /app/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./package.json

# Copy database schema (needed for initialization)
COPY --chown=apiuser:nodejs database/schema.sql ./database/schema.sql

# Create data directories
RUN mkdir -p /data/database /data/scripts /data/audio-cache /data/logs && \
    chown -R apiuser:nodejs /data

# Entrypoint will handle permission fixes and switch to apiuser
ENTRYPOINT ["docker-entrypoint.sh"]

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]
