# Carsea

Independent new-car research for buyers in Indonesia. See [SPEC.md](SPEC.md) for
the product specification and delivery phases.

**Status:** Phase 1 foundation. The app builds, routes by locale, and has
database tooling, but there is no catalog, design system, or product page yet.

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
npm run dev                 # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run lint` / `typecheck` / `test` | ESLint, TypeScript, Vitest |
| `npm run db:generate` | Generate a SQL migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` |

`drizzle-kit` reads `DATABASE_URL` from the environment; export it or run the
scripts with `node --env-file=.env`.

## Running the full stack in Docker

```bash
docker compose --profile app up -d --build
curl http://localhost:3000/api/health
```

`/api/health` returns `200` only when the app can reach the database, and `503`
otherwise. The container health check uses it.

## Layout

- `src/app/[lang]/` — localized routes. Every public page lives under `/id` or `/en`.
- `src/proxy.ts` — redirects unprefixed paths to the saved locale (cookie
  `carsea-locale`) or Bahasa Indonesia.
- `src/i18n/` — locale config and dictionaries. `id.json` defines the key set;
  `en.json` must match it or the build fails.
- `src/db/` — database client and schema (catalog tables arrive in Phase 3).

## Not done yet

Phase 1 also calls for confirming data sources, data rights, cost-model inputs,
and image rights (SPEC §15). Those need decisions outside this repository.
