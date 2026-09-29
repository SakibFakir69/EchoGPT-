

# ---- deps: all dependencies (for build) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client generation (add --config prisma7.config.ts if your setup needs it)
RUN npx prisma generate
RUN npm run build
# strip dev deps
RUN npm prune --omit=dev

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=build /app/package*.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]