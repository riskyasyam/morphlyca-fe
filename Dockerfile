# ---------- Deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
# untuk beberapa lib native
RUN apk add --no-cache libc6-compat
# copy manifest & install deps pakai PM yang ada
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- Builder ----------
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# === build args dari docker-compose (NEXT_PUBLIC_*) ===
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL
ARG NEXT_PUBLIC_PRIMEAUTH_REALM_ID
ARG NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID
ARG NEXT_PUBLIC_PRIMEAUTH_REDIRECT_URI
ARG NEXT_PUBLIC_PRIMEAUTH_TOKEN_URL
ARG NEXT_PUBLIC_MINIO_PUBLIC_BASE
ARG NEXT_PUBLIC_MINIO_ALLOWED_PREFIX

# expose ke proses build (Next.js akan "bake" ke bundle)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL=$NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL
ENV NEXT_PUBLIC_PRIMEAUTH_REALM_ID=$NEXT_PUBLIC_PRIMEAUTH_REALM_ID
ENV NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID=$NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID
ENV NEXT_PUBLIC_PRIMEAUTH_REDIRECT_URI=$NEXT_PUBLIC_PRIMEAUTH_REDIRECT_URI
ENV NEXT_PUBLIC_PRIMEAUTH_TOKEN_URL=$NEXT_PUBLIC_PRIMEAUTH_TOKEN_URL
ENV NEXT_PUBLIC_MINIO_PUBLIC_BASE=$NEXT_PUBLIC_MINIO_PUBLIC_BASE
ENV NEXT_PUBLIC_MINIO_ALLOWED_PREFIX=$NEXT_PUBLIC_MINIO_ALLOWED_PREFIX
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# build (deteksi PM)
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- Runner ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# user non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# copy hasil build "standalone"
# (butuh next.config.js -> output: 'standalone')
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# healthcheck sederhana (alpine punya wget BusyBox)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://localhost:3000/ >/dev/null || exit 1

CMD ["node", "server.js"]