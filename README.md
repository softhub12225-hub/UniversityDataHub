# Overseas University DataHub — Reviewer Console

The Next.js console for an internal university data management and verification
platform. Every published fact carries its official source, a stored snapshot of that
source, the reviewer who approved it, and the version it was published in — and this is
the screen a reviewer uses to read that evidence and decide.

The API is a separate repository and a separate deployment:
**[DataHubBackend](https://github.com/softhub12225-hub/DataHubBackend)**.

## What it does

| Screen | What a reviewer does there |
|---|---|
| `/review/login` | signs in; the session cookie is HttpOnly and set by the API |
| `/review` | the dashboard: trust counts, the safety panel, manifest state, audit chain |
| `/review/institutions` | every institution, with its domain and source progress |
| `/review/institutions/[id]` | the trust root, the pilot sources, the responsibility cards |
| `/review/institutions/[id]/candidates` | scope and conflict resolution over extracted candidates |
| `/review/operations` | the audit trail |

Every real operation is **preview then confirm**. A preview writes nothing and returns
a signed token over a fingerprint of everything shown; confirming re-checks every fact
and refuses the token if anything moved. So a reviewer never confirms a screen that has
gone stale, and the console never decides anything itself — it renders the API's verdict.

## The console holds no database credential

That is the point of the architecture, not an incidental property.

```
browser  ──▶  /api/review/*  (Next.js route handler, server-side)  ──▶  FastAPI
```

`API_BASE_URL` is deliberately **not** `NEXT_PUBLIC_`, so Next.js will not inline it
into the client bundle, and `apiBaseUrl()` throws if it is read from client code. The
browser talks only to this app's own origin; the route handler forwards cookies, the
CSRF header and the content type — an explicit allow-list, because a proxy that
forwards everything eventually forwards something it should have dropped.

The proxy makes no decisions. It does not inspect the session, judge permissions or
interpret bodies. FastAPI does all of that, and a second policy in the browser tier
would be a second policy to keep in sync.

## Requirements

| Tool | Version | Notes |
|---|---|---|
| Node | 22.23.2 | Pinned in `.node-version` / `.nvmrc`; floor is `>=22.13.0` |
| pnpm | 9.15.4 | `corepack enable` |

`engine-strict=true` is set in `.npmrc`, so pnpm refuses to install or run under an
unsupported Node version. That is deliberate: local-vs-CI Node divergence produces
builds that work on one machine and not another.

## Quick start

```bash
cp .env.example .env         # then set API_BASE_URL
pnpm install --frozen-lockfile
pnpm --filter @datahub/web run dev
```

Then open <http://localhost:3000/review>. The API must be running and reachable at
`API_BASE_URL`; if it is not, the console says `API_UNREACHABLE` rather than
pretending a request was refused.

## Deploying

This is a pnpm workspace with the app in `apps/web`, so a deployment needs to know
that. Two supported shapes:

**Vercel / Netlify / any Node host.** Set the project's root directory to `apps/web`,
or keep it at the repository root and use:

```
install:  pnpm install --frozen-lockfile
build:    pnpm --filter @datahub/web run build
start:    pnpm --filter @datahub/web run start
```

**Docker.** `infra/docker/web.Dockerfile`, built with the **repository root as the
build context** — it copies the workspace manifests, `apps/web` and
`packages/api-types`. The runtime stage contains only the standalone build output, and
runs as a non-root user.

### Environment

| Variable | When it is read | Notes |
|---|---|---|
| `API_BASE_URL` | every request, server-side | so one built image can be pointed at staging or production |
| `API_TIMEOUT_MS` | every request | a slow API and a stopped one must not look the same |
| `NEXT_PUBLIC_APP_ENV` | **build time** | inlined into the bundle; display only. Changing it needs a rebuild |

The API must also list this deployment's origin in its `CORS_ALLOWED_ORIGINS`. No
wildcards — a wildcard cannot carry cookies, and the session depends on them.

## Generated API types

`packages/api-types` is generated from the API's OpenAPI document and **committed**, so
a checkout of this repository alone installs and builds.

Regenerating needs both halves of the codebase: `scripts/generate-api-types.mjs` spawns
`uv` against the API source. With the backend repository checked out alongside this one,
run its `make export-openapi`, copy the document into `packages/api-types/openapi.json`,
then `pnpm run generate:api-types`.

The monorepo had a CI job that regenerated the types and failed on drift. Splitting the
repositories removed it, and nothing has replaced it yet — so a field the API renames
is caught by `pnpm run typecheck` only where the console reads it through the generated
types. Most console screens use the hand-written types in `src/lib/review/types.ts`,
which are not covered at all.

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm --filter @datahub/web run dev` |
| Lint | `pnpm run lint` |
| Type-check | `pnpm run typecheck` |
| Tests | `pnpm --filter @datahub/web run test` |
| Production build | `pnpm --filter @datahub/web run build` |

## Layout

```
apps/web/src/
  app/
    api/review/[...path]/   the BFF proxy — the only route that talks to the API
    review/                 the console's pages
  components/review/        cards, the evidence viewer, the audit table, primitives
  lib/
    config/env.ts           server-only configuration, and the guard that keeps it so
    review/client.ts        typed calls against /api/review/*
    review/types.ts         hand-written response types for the console endpoints
packages/api-types/         generated from the API's OpenAPI document
infra/docker/               the production image
```
