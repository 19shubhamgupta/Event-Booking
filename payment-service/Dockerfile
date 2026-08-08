# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production


# Run as non-root user (security best practice — Alpine images run as root by default)
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER nodeuser

EXPOSE 5006

CMD ["node", "index.js"]