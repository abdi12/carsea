# Carsea

Independent new-car research for buyers in Indonesia. See [SPEC.md](SPEC.md) for
the product specification and delivery phases.

**Status:** Phase 4. Every public page in the specification is built in both
languages and reads from the catalog. No real vehicle data is loaded: with an
empty database the catalog pages say so, and the only data in the repository
is a fictional sample set.

- [PRODUCT.md](PRODUCT.md) — product context for design work.
- [DESIGN.md](DESIGN.md) — the design system: tokens, type, components, rules.
- [docs/data-import.md](docs/data-import.md) — maintaining catalog data.

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

## How the pages get their data

- Home, the finder, compare, guides, methodology, privacy, and terms are
  prerendered and need no database to build or serve.
- Browse, a car's page, recommendations, service centres, and the sitemap read
  the database on each request.
- Matching runs in the browser from public catalog data, so finder answers
  are never sent to the server. Compare fetches cars by id from
  `/api/variants`.

## Not done yet

- Real catalog data, licensed photography, and a map for service centres.
- Legal review of the privacy and terms text, which is marked as a draft.
- Editorial review of the guides and of the English translations.
- Analytics, and the Phase 5 production hardening.

The font (Archivo) is fetched from Google Fonts at build time and self-hosted
from then on, so builds need network access.

Phase 1 also calls for confirming data sources, data rights, cost-model inputs,
and image rights (SPEC §15). Those need decisions outside this repository.
