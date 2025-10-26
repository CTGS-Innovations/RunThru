# ==================================
# RunThru Frontend Dockerfile
# Next.js 15 + React 18 + TypeScript
# ==================================
# This builds the frontend from the main worktree root

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Accept build argument
ARG BACKEND_URL=http://backend:4000

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BACKEND_URL=${BACKEND_URL}

# Build Next.js application
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (public assets are bundled in standalone if they exist)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname to 0.0.0.0 to allow external connections
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
