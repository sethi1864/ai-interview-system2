# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for both backend and frontend
COPY package*.json ./
COPY client/package*.json ./client/

# Install backend dependencies
RUN npm ci --only=production

# Install frontend dependencies
WORKDIR /app/client
RUN npm ci --only=production

# Build frontend
RUN npm run build

# Back to root directory
WORKDIR /app

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]