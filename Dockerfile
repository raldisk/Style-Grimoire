# ── Stage 1: Build frontend ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install frontend deps
COPY package*.json ./
RUN npm ci

# Build Vite app → /app/dist
COPY . .
RUN npm run build

# ── Stage 2: Production server ────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install server deps only
COPY server/package.json ./server/
RUN cd server && npm install --production

# Copy server source + built frontend
COPY server/index.js ./server/
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
