FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/service/package.json apps/service/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspace @html-pdf/service --include-workspace-root

FROM deps AS build
COPY apps/service apps/service
RUN npm run build -w @html-pdf/service

FROM node:22-bookworm-slim AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/service/dist ./dist
RUN mkdir -p /data/jobs && chown -R node:node /data/jobs /app
USER node
EXPOSE 4000
CMD ["node", "dist/api.js"]

FROM mcr.microsoft.com/playwright:v1.55.1-noble AS worker
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends libreoffice-writer libreoffice-calc libreoffice-core poppler-utils ghostscript qpdf zip ffmpeg fonts-dejavu fonts-liberation \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/service/dist ./dist
RUN mkdir -p /data/jobs && chown -R pwuser:pwuser /data/jobs /app
USER pwuser
CMD ["node", "dist/worker.js"]
