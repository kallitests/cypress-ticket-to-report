#!/bin/sh
# Entrypoint for the RWA (System Under Test) container.
#
# 1. Load the deterministic fixture dataset RWA ships
#    (data/database-seed.json) into the live lowdb file (data/database.json).
#    This is the same "db:seed:dev" flow RWA's own local/dev workflow uses —
#    deterministic on purpose, so smoke/regression runs are reproducible
#    instead of depending on the randomly-generated "db:seed" faker output.
# 2. Build the frontend once (build:ci skips the type-check prebuild hook,
#    which already ran upstream in RWA's own pipeline).
# 3. Start the proxy/static server (port 3000) and the API (port 3001)
#    concurrently — this is exactly what RWA's "start:ci" script does, the
#    same entrypoint their CircleCI config uses to run Cypress against
#    itself.
set -e

yarn db:seed:dev
yarn build:ci
exec yarn start:ci
