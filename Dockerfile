# syntax=docker/dockerfile:1
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Operational tooling: migrations, catalog import, and the data review.
# Not part of the running app; started on demand (see docs/operations.md).
FROM node:24-alpine AS tools
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
ENTRYPOINT ["npm", "run"]

FROM node:24-alpine AS build
WORKDIR /app
# Public origin baked into canonical/alternate links of prerendered pages.
ARG SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1 SITE_URL=$SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
