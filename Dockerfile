# ── Etapa 1: Build ─────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Generar Prisma client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Build frontend (Vite) + backend (esbuild)
RUN npm run build

# ── Etapa 2: Runtime ───────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Artefactos del build
COPY --from=builder /app/dist ./dist

# Prisma client generado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma schema para migrate/db push en runtime
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Script de arranque
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
