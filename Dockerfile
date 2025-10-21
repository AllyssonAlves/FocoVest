# Dockerfile para FocoVest - Produção Multi-stage

# Estágio 1: Build do frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client

# Copiar package.json e package-lock.json do frontend
COPY client/package*.json ./
RUN npm ci --only=production

# Copiar código fonte do frontend
COPY client/ ./

# Build da aplicação React
RUN npm run build

# Estágio 2: Build do backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/server

# Copiar package.json e package-lock.json do backend
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte do backend
COPY server/ ./

# Build da aplicação TypeScript
RUN npm run build

# Estágio 3: Produção
FROM node:18-alpine AS production

# Instalar dependências do sistema
RUN apk add --no-cache \
  tini \
  curl \
  && rm -rf /var/cache/apk/*

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
  adduser -S focovest -u 1001

# Criar diretórios
WORKDIR /app
RUN mkdir -p /app/server /app/client/dist && \
  chown -R focovest:nodejs /app

# Copiar aplicação do backend buildado
COPY --from=backend-builder --chown=focovest:nodejs /app/server/dist ./server/dist
COPY --from=backend-builder --chown=focovest:nodejs /app/server/node_modules ./server/node_modules
COPY --from=backend-builder --chown=focovest:nodejs /app/server/package*.json ./server/

# Copiar frontend buildado
COPY --from=frontend-builder --chown=focovest:nodejs /app/client/dist ./client/dist

# Copiar arquivos de configuração
COPY --chown=focovest:nodejs server/.env.example ./server/.env.example

# Mudar para usuário não-root
USER focovest

# Expor porta
EXPOSE 5000

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Usar tini como init process
ENTRYPOINT ["/sbin/tini", "--"]

# Comando para iniciar a aplicação
CMD ["node", "server/dist/server.js"]