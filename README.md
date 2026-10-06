# Carsea

Independent new-car research for buyers in Indonesia. See [SPEC.md](SPEC.md) for
the product specification and delivery phases.

**Status:** Phase 5. The product is built and the production tooling
(deploy, rollback, encrypted backup, restore, data review) has been exercised
on a local stack. It is not launched: there is no real vehicle data, the
legal text is a draft, and nothing has run on a real server. See the
[launch checklist](docs/launch-checklist.md).

- [PRODUCT.md](PRODUCT.md) — product context for design work.
- [DESIGN.md](DESIGN.md) — the design system: tokens, type, components, rules.
- [docs/data-import.md](docs/data-import.md) — maintaining catalog data.
- [docs/operations.md](docs/operations.md) — deploying and operating in production.
- [docs/launch-checklist.md](docs/launch-checklist.md) — what is verified and what is left.
- [docs/3d-preview-evaluation.md](docs/3d-preview-evaluation.md) — whether to build a 3D colour preview, and the conditions for it.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS 4
- PostgreSQL 16 via Drizzle ORM (`postgres` driver), SQL migrations in `drizzle/`
- Vitest for unit tests
- Docker / Docker Compose for self-hosting

## Local development

Requires Node.js 24+ and Docker (or any PostgreSQL 16 instance).

```bash
cp .env.example .env        # then change the password
npm install
docker compose up -d db     # PostgreSQL on 127.0.0.1:5432
npm run db:migrate          # create the catalog tables
npm run db:import -- data/sample --allow-sample   # fictional development data
npm run dev                 # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run lint` / `typecheck` / `test` | ESLint, TypeScript, Vitest |
| `npm run db:generate` | Generate a SQL migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` |
| `npm run db:import -- <dir>` | Validate and load catalog CSV files ([guide](docs/data-import.md)) |
| `npm run db:review` | Report stale data, missing prices, sample data, and usage counts |

`drizzle-kit` reads `DATABASE_URL` from the environment; export it or run the
scripts with `node --env-file=.env`.

## Running the full stack in Docker

For a quick local run of the app image next to the development database:

```bash
docker compose --profile app up -d --build
curl http://localhost:3000/api/health
```

`/api/health` returns `200` only when the app can reach the database, and `503`
otherwise. The container health check uses it.

Production uses a separate stack in `deploy/` with a TLS proxy, a restricted
database role, and scripts for deploy, rollback, backup, and restore. See
[docs/operations.md](docs/operations.md).

## Layout

- `src/app/[lang]/` — localized routes. Every public page lives under `/id` or `/en`.
- `src/proxy.ts` — redirects unprefixed paths to the saved locale (cookie
  `carsea-locale`) or Bahasa Indonesia.
- `src/i18n/` — locale config and dictionaries. `id.json` defines the key set;
  `en.json` must match it or the build fails.
- `src/app/globals.css` — the semantic token layer for both themes. Raw color
  values live only here.
- `src/components/` — shared primitives: wordmark, header, footer, buttons,
  stamps, icons, theme and language controls.
- `src/content/` — buying guides, the methodology page, and draft legal text,
  in both languages.
- `src/lib/research-store.ts` — finder answers, comparison, and saved cars,
  kept in the buyer's browser only.
- `src/db/` — schema, connection, and the query that feeds matching.
- `src/domain/` — rules with no framework or database code: the catalog
  vocabulary, freshness, ownership cost, and matching. Each has tests.
- `src/import/` and `scripts/import-catalog.ts` — CSV reading, validation,
  reporting, and writing.
- `data/sample/` — fictional catalog for development. Never for production.
- `deploy/` — the production Compose stack, proxy configuration, and
  operational scripts.

## How the pages get their data

- Home, the finder, compare, guides, methodology, privacy, and terms are
  prerendered and need no database to build or serve.
- Browse, a car's page, recommendations, service centres, and the sitemap read
  the database on each request.
- Matching runs in the browser from public catalog data, so finder answers
  are never sent to the server. Compare fetches cars by id from
  `/api/variants`.

## Privacy by construction

- Finder answers, the comparison, and saved cars never leave the browser.
- Usage is measured as per-day counts of named actions (`/api/event`). There
  is no cookie, identifier, or per-visitor record, and nothing is sent when the
  browser signals Global Privacy Control or Do Not Track.
- The only cookie is the language choice.

## Not done yet

See [docs/launch-checklist.md](docs/launch-checklist.md). In short: real
catalog data and photography, legal and editorial review, manual accessibility
and real-device testing, and a real server.
