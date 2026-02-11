FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Use corepack for pnpm (recommended for Node.js 20+)
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build with optional API URL override
RUN if [ -n "$NEXT_PUBLIC_API_URL" ]; then \
      export NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL && pnpm build; \
    else \
      pnpm build; \
    fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the standalone output (much smaller image)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Standalone uses server.js instead of pnpm start
CMD ["node", "server.js"]

