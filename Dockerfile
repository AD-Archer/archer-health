# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Copy data directory for seeding
COPY data ./data

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Create a script to run migrations and seed, then start the app
RUN echo '#!/bin/sh\n\
npx prisma migrate deploy\n\
npx prisma db seed\n\
pnpm start' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]