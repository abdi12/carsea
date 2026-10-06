# Operating Carsea

How to run Carsea in production on a single Linux server with Docker. This
is the handoff document for whoever operates it.

Everything here was exercised on a local Docker stack. It has **not** been
run on a real server, with a real domain, or with a publicly issued
certificate.

## What runs

| Service | Role | Reachable from |
|---|---|---|
| `proxy` (Caddy) | TLS, HTTP to HTTPS redirect, compression, access log | The internet, ports 80 and 443 |
| `app` (Next.js) | The site | The proxy only |
| `db` (PostgreSQL 16) | The catalog and usage counts | The app and tools only |
| `tools` | Migrations, catalog import, data review. Started on demand | The database only |
| `backup` | One encrypted dump per run. Started on demand | The database only |

The app and database publish no ports. The database network has no route
to the internet.

The app connects to the database as a restricted role: it can read the
catalog and add to the usage counters, and nothing else. Migrations,
imports, and backups use the owner role through the `tools` and `backup`
containers.

## Before the first deploy

1. A server with Docker and the Compose plugin, and this repository checked
   out (the examples assume `/srv/carsea`).
2. A domain whose DNS points at the server, with ports 80 and 443 open.
   Caddy obtains and renews the certificate by itself once that is true.
3. An [age](https://age-encryption.org) key pair for backups. Generate it
   on **another machine** with `age-keygen -o carsea-backup.key`. Only the
   public key (`age1...`) goes on the server. If the private key is lost,
   the backups cannot be read.
4. Somewhere off the server to copy backups to.
5. `cp deploy/.env.production.example deploy/.env.production`, then fill it
   in. Use long random passwords. This file is gitignored; keep it that way.

## Deploy

```bash
cd /srv/carsea
git pull
deploy/deploy.sh
```

The script:

1. builds the app and tools images, tagged with the git commit;
2. backs up the database as it stands (skipped on the very first deploy);
3. applies database migrations and re-grants the app role;
4. starts the new app and waits for its health check;
5. puts the previous version back if the new one does not become healthy,
   and exits non-zero.

Deploy from a clean checkout. The script warns if there are uncommitted
changes, because they would be built into an image named after a commit
that does not contain them.

Replacing the app container interrupts service for a few seconds.

## Roll back

```bash
deploy/rollback.sh          # the version before the current one
deploy/rollback.sh a1b2c3d  # a specific earlier tag
```

This switches the app image only. The database is not changed.

**Migrations are forward-only.** Write each one so the previous app version
still works against the new schema: add columns and tables first, remove
old ones in a later release. Then rolling the app back never needs a schema
change. If a migration itself is wrong, restore the backup that
`deploy.sh` took just before it.

## Load or update catalog data

Put the CSV files in the directory named by `CATALOG_DIR` (default
`deploy/catalog`), then:

```bash
C="docker compose -f deploy/compose.yaml --env-file deploy/.env.production"
export APP_TAG=$(cat deploy/.state/current)

$C --profile tools run --rm tools db:import -- /catalog --dry-run   # check only
$C --profile tools run --rm tools db:import -- /catalog             # write
```

Read the dry-run report before writing. The file formats and rules are in
[data-import.md](data-import.md). Never pass `--allow-sample` here.

## Review the data

```bash
$C --profile tools run --rm tools db:review
```

Prints what is published, which cars have no current price, which prices
age out within 14 days, stale facts and service centres, the last import,
and the last 30 days of usage counts. It exits non-zero if sample data is
present. Add `-- --fail-on-stale` to also fail on stale data.

Run it at least weekly. A car whose price has aged out silently drops out
of recommendations, so the 14-day warning is the prompt to re-check prices
with the source and re-import.

## Backups

```bash
deploy/backup-now.sh
```

Writes `carsea-<UTC time>.sql.gz.age` to `BACKUP_DIR`, encrypted to
`BACKUP_RECIPIENT`, records the time in `LAST_SUCCESS`, deletes dumps older
than `BACKUP_KEEP_DAYS`, then runs `BACKUP_SYNC_CMD` to copy them off the
server. Without `BACKUP_SYNC_CMD` it prints a warning: a backup that exists
only on the server it protects is not a backup.

Schedule it daily from the host's cron:

```cron
30 2 * * * /srv/carsea/deploy/backup-now.sh >> /var/log/carsea-backup.log 2>&1
```

The script exits non-zero if the dump fails, is implausibly small, or the
off-server copy fails.

### Restore

Bring the private key to the server for the restore and remove it after.

```bash
deploy/restore.sh deploy/backups/carsea-20261006T023000Z.sql.gz.age /root/carsea-backup.key --yes
```

This **replaces** the database contents with the backup's, in a single
transaction, then re-grants the app role.

**Test a restore on a schedule**, at least quarterly: restore the latest
off-server copy into a scratch stack and run `db:review` against it. An
untested backup is a hope, not a backup.

## Monitoring

Nothing here is automated yet; these are the signals to wire into whatever
monitoring the operator chooses.

| Check | How | Alert when |
|---|---|---|
| Site is up | `GET https://<domain>/api/health` | Not `200`. It returns `503` when the app cannot reach the database |
| A page renders | `GET https://<domain>/id` | Not `200` |
| Containers | `docker compose ... ps` | Any service not `healthy` / `running` |
| Backups | Age of `deploy/backups/LAST_SUCCESS` | Older than 26 hours |
| Backup job | Exit status of `backup-now.sh` | Non-zero |
| Data freshness | Exit status of `db:review -- --fail-on-stale` | Non-zero |
| Certificate | Expiry of the served certificate | Under 14 days (Caddy renews at about 30) |
| Disk | Free space on the Docker volume and backup directory | Under 20% |

One known gap: when the database is down, catalog pages show an error
screen but still answer with HTTP `200`, because the page has started
streaming before the query fails. Monitor `/api/health`, not a catalog
page's status code.

## Logs and privacy

- The proxy's access log keeps method, path, status, and timing. Addresses
  are truncated (IPv4 to /24, IPv6 to /48) and request headers, cookies,
  and the comparison's `ids` query are dropped.
- Container logs rotate at 10 MB, five files each.
- The app stores no personal data. Its only writes are per-day counts of
  named actions in `usage_counts`.

## Security notes

- Headers set on every response: Content-Security-Policy, HSTS (at the
  proxy), `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, and a `Permissions-Policy` that denies location,
  camera, microphone, and payment.
- The Content-Security-Policy allows inline scripts, which Next.js needs
  without per-request nonces. No third-party origin is allowed for
  scripts, styles, fonts, images, frames, or connections.
- `/api/event` accepts only names from a fixed list and caps writes at 50
  per second for the whole site. There is no per-client rate limit, since
  the app keeps nothing that identifies a client. Add one at the proxy or
  firewall if the endpoint is abused.
- Keep the host, Docker, and the base images patched. `npm audit` currently
  reports findings in development dependencies; review them before launch.

## Environments

Use a separate server, or at least a separate checkout and
`ENV_FILE=deploy/.env.staging deploy/deploy.sh`, for staging. Never copy
production secrets or a production backup into an environment that is
publicly reachable. The development stack in the repository root
(`compose.yaml`) uses its own Compose project and volumes and is not for
production.
