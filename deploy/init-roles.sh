#!/bin/sh
# Runs once, when the database volume is first created.
#
# The app connects as a separate role with least privilege (SPEC §12):
# it reads the catalog and may write only the usage counters. Migrations
# and imports run as the owner role through the tools container.
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_user="$APP_DB_USER" -v app_password="$APP_DB_PASSWORD" <<'SQL'
CREATE ROLE :"app_user" LOGIN PASSWORD :'app_password';
GRANT CONNECT ON DATABASE :"DBNAME" TO :"app_user";
GRANT USAGE ON SCHEMA public TO :"app_user";
-- Applies to tables the owner creates later, i.e. by migrations.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO :"app_user";
SQL
