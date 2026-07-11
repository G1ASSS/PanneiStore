# ─── Build Stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files and install deps
COPY backend/package*.json ./
RUN npm ci --include=dev

# Copy backend source and prisma schema
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ─── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production deps
COPY backend/package*.json ./
RUN npm ci --include=dev --omit=dev

# Copy built output and prisma from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY backend/prisma ./prisma

# Expose port (Railway will override with PORT env var)
EXPOSE 5001

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null || true && node dist/server.js"]
