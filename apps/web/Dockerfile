FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY apps/service/package.json apps/service/package.json
RUN npm install --workspace @html-pdf/web --include-workspace-root

FROM deps AS build
ARG PUBLIC_ORIGIN=http://localhost:8090
ARG NEXT_PUBLIC_API_BASE=/api
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_ADSENSE_CLIENT
ARG NEXT_PUBLIC_ADSENSE_HOME_SLOT
ARG NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT
ARG NEXT_PUBLIC_GA_ID
ENV PUBLIC_ORIGIN=$PUBLIC_ORIGIN
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_ADSENSE_CLIENT=$NEXT_PUBLIC_ADSENSE_CLIENT
ENV NEXT_PUBLIC_ADSENSE_HOME_SLOT=$NEXT_PUBLIC_ADSENSE_HOME_SLOT
ENV NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=$NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
COPY apps/web apps/web
RUN npm run build -w @html-pdf/web

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=build --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
