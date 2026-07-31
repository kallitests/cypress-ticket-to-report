# Official Cypress image, includes Node.js, Cypress and all browser dependencies
FROM cypress/included:13.13.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Default command runs the smoke suite; overridden by docker-compose / k8s Job
CMD ["npx", "cypress", "run", "--env", "tags=@smoke"]
