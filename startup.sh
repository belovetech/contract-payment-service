#!/usr/bin/env sh

set -ex
# run database migrations
npm run db:migrate
# seed database
npm run db:seed

# start server
exec "$@"
