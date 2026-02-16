FROM node:18-alpine AS builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy built app from builder
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
