# Cypress test-runner image (this repo's own framework, not the SUT).
# Version pinned to match the `cypress` devDependency in package.json exactly
# — the previous Dockerfile pinned 13.13.0 against a 15.x devDependency,
# which would silently run a different Cypress version in Docker/k8s than
# what's used locally/in CI.
FROM cypress/included:15.19.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Default command runs the smoke suite; overridden by docker-compose / k8s Job
CMD ["npx", "cypress", "run", "--env", "grepTags=@smoke"]
