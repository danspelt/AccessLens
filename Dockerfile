# Dependencies stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

# Allow Coolify-provided build args to be used during `next build`
# AUTH_SECRET is required here (not only at runtime): Auth.js middleware runs on the
# Edge runtime and Next.js inlines env into that bundle at build time.
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ARG MONGODB_DB
ENV MONGODB_DB=$MONGODB_DB
ARG AUTH_SECRET
ENV AUTH_SECRET=$AUTH_SECRET

RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Carry runtime env through as well (Coolify can also set it at runtime)
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ARG MONGODB_DB
ENV MONGODB_DB=$MONGODB_DB

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install wget for health check (must be done as root, before USER switch)
RUN apk add --no-cache wget

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public directory (will be empty if no files, but directory exists)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check - use wget (available in alpine)

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

