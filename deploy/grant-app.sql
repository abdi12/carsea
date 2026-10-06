-- Run after every migration (deploy.sh does this). Read access comes from
-- the default privileges set in init-roles.sh; these are the only writes
-- the running app is allowed.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO :"app_user";
GRANT INSERT, UPDATE ON usage_counts TO :"app_user";
REVOKE ALL ON import_runs FROM :"app_user";
