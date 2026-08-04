# System Under Test image: cypress-realworld-app (RWA).
#
# RWA (https://github.com/cypress-io/cypress-realworld-app) ships neither a
# Dockerfile nor a docker-compose.yml of its own — this one is ours, built on
# top of the app vendored as a pinned git submodule at
# vendor/cypress-realworld-app (see docs/adr/0002-rwa-as-sut-custom-image.md).
#
# It reproduces the same startup path RWA's own CI (CircleCI) uses to run
# Cypress against itself: a pre-built static bundle served through a small
# Express proxy (frontend, port 3000) alongside the Express/lowdb API
# (backend, port 3001) — see scripts/testServer.ts and the "start:ci" /
# "build:ci" scripts in vendor/cypress-realworld-app/package.json.
FROM node:22-alpine

# node-gyp and friends: some RWA dependencies compile native addons on install.
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

COPY vendor/cypress-realworld-app/package.json vendor/cypress-realworld-app/yarn.lock ./

# --ignore-scripts: RWA's postinstall runs "husky install", which expects a
# .git directory that doesn't exist in this image layer and would otherwise
# fail the build. patch-package (the other postinstall step) is run
# explicitly below instead, once the full source is present.
RUN yarn install --frozen-lockfile --ignore-scripts

COPY vendor/cypress-realworld-app/ .
RUN npx patch-package

COPY docker/rwa-entrypoint.sh /usr/local/bin/rwa-entrypoint.sh
RUN chmod +x /usr/local/bin/rwa-entrypoint.sh

ENV NODE_ENV=test
ENV PORT=3000
ENV VITE_BACKEND_PORT=3001

EXPOSE 3000 3001

# Combines "backend is up" and "seed data has been applied" into a single
# check: /testData/* is only mounted when NODE_ENV=test|development (see
# backend/app.ts), so a 200 here means the API is genuinely ready to use.
HEALTHCHECK --interval=5s --timeout=3s --start-period=45s --retries=30 \
  CMD wget -qO- http://localhost:3001/testData/users || exit 1

ENTRYPOINT ["/usr/local/bin/rwa-entrypoint.sh"]
