# Use Node.js 22 Alpine for smaller image
FROM node:22-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat wget

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Copy data directory for seeding
COPY data ./data

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# NOTE: Clerk publishable key should NOT be hardcoded at build time.
# If your app requires Clerk during the build (for server-side rendering),
# pass a build-arg in CI and take care not to bake it into the final image.
# We keep an ARG here so CI can reference it if absolutely necessary, but
# we do NOT set it as an ENV to avoid persisting it into image layers.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat wget

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Define build argument for port with default value
ARG PORT=3000
ENV PORT=${PORT}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user first
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including dev dependencies for Next.js server)
RUN pnpm install --frozen-lockfile

# Copy built application from base stage
COPY --from=base --chown=nextjs:nodejs /app/.next ./.next
COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=base --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE ${PORT}

# Health check using the configured port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start the application with migration
CMD ["sh", "-c", "npx prisma migrate deploy || echo 'Migration failed, continuing...' && npm start"]