# Publishing `@wyrly/*`

Japanese: [PUBLISHING.ja.md](./PUBLISHING.ja.md)

This repository publishes **six packages to JSR** (Deno) and **five to npm** (Node / bundlers).
`@wyrly/fresh` is **JSR-only** because Fresh 2.x has no npm distribution (`jsr:@fresh/core`).

| Package          | JSR                  | npm (registry.npmjs.org) |
| ---------------- | -------------------- | ------------------------ |
| `@wyrly/core`    | `jsr:@wyrly/core`    | `@wyrly/core`            |
| `@wyrly/express` | `jsr:@wyrly/express` | `@wyrly/express`         |
| `@wyrly/hono`    | `jsr:@wyrly/hono`    | `@wyrly/hono`            |
| `@wyrly/fresh`   | `jsr:@wyrly/fresh`   | — (JSR only)             |
| `@wyrly/graphql` | `jsr:@wyrly/graphql` | `@wyrly/graphql`         |
| `@wyrly/next`    | `jsr:@wyrly/next`    | `@wyrly/next`            |

All packages share the same **semver** in each `packages/*/deno.json` and are released together
under a git tag `vX.Y.Z`.

## Prerequisites

- **Deno 2.x** (development and JSR publish)
- **Node.js 24.x** + **npm 11.5.1+** in CI (Trusted Publishing; Node 20.x+ is fine for local dnt
  builds)
- **JSR**: `@wyrly` scope on [jsr.io](https://jsr.io/)
- **npm**: `@wyrly` organization on [npmjs.com](https://www.npmjs.com/) (free public packages)

**GitHub Actions does not use long-lived tokens.** CI authenticates via
[JSR OIDC](https://jsr.io/docs/publishing-packages#publishing-from-github-actions) and
[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/). Complete the one-time registry
setup below before the first tagged release.

## One-time registry setup (before first CI publish)

Replace `OWNER/REPO` with this repository (for example `your-org/wyrly-oss`).

### JSR — link GitHub repository (6 packages)

For each package, create it at [jsr.io/new](https://jsr.io/new) if needed, then open **Settings →
GitHub repository**, enter `OWNER/REPO`, and click **Link**:

- [ ] `@wyrly/core`
- [ ] `@wyrly/express`
- [ ] `@wyrly/hono`
- [ ] `@wyrly/fresh`
- [ ] `@wyrly/graphql`
- [ ] `@wyrly/next`

The publish workflow must be [`.github/workflows/publish.yml`](./.github/workflows/publish.yml)
(filename `publish.yml`).

### npm — Trusted Publisher (5 packages)

Under the **`wyrly`** org, register **Trusted Publisher → GitHub Actions** for each npm package (or
from org settings when the package does not exist yet):

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| Repository        | `OWNER/REPO`                                        |
| Workflow filename | `publish.yml`                                       |
| Environment       | _(leave empty unless you use a GitHub Environment)_ |

Packages:

- [ ] `@wyrly/core`
- [ ] `@wyrly/express`
- [ ] `@wyrly/hono`
- [ ] `@wyrly/graphql`
- [ ] `@wyrly/next`

(`@wyrly/fresh` is not published to npm.)

### JSR Score (manual, per package Settings)

After each release, on [jsr.io](https://jsr.io/) open **Settings** for every `@wyrly/*` package:

| Field                     | Suggested value                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Description**           | One sentence (≤250 chars). Example core: `Explicit DI for modern TypeScript — typed tokens, standard decorators, request scopes.` |
| **Runtime compatibility** | Set per package using the [JSR Runtime checklist](#jsr-runtime-checklist) below (aligned with `deno task test:compat` in CI).     |
| **Readme source**         | Default (module doc on Overview when `@module` is present in `mod.ts`)                                                            |

#### JSR Runtime checklist

After each release, on [jsr.io/@wyrly](https://jsr.io/@wyrly) open **Settings → Runtime
compatibility** for each package and apply:

| Package          | Deno      | Node.js     | Bun       | Cloudflare Workers |
| ---------------- | --------- | ----------- | --------- | ------------------ |
| `@wyrly/core`    | Supported | Supported   | Supported | Supported          |
| `@wyrly/hono`    | Supported | Supported   | Supported | Supported          |
| `@wyrly/express` | Supported | Supported   | Supported | Unknown            |
| `@wyrly/graphql` | Supported | Supported   | Supported | Unknown            |
| `@wyrly/next`    | Supported | Supported   | Supported | Unknown            |
| `@wyrly/fresh`   | Supported | Unsupported | Unknown   | Unknown            |

- **Supported** — verified by CI (`compat/node`, `compat/bun`, and/or `compat/workers` as
  applicable).
- **Unknown** — not smoke-tested on that runtime (safe default).
- **Unsupported** — not applicable (`@wyrly/fresh` has no npm build; Node.js is N/A).

Code-side: GitHub Actions and local **`deno task ci`** run `ci:deno` (fmt, `check:npm-readme`, lint,
`doc:lint` on `core` / `express` / `graphql` / `fresh` `mod.ts`, check, test, examples), then JSR
`publish:dry-run`, **`test:compat`**, and `publish:npm:dry-run`. `@wyrly/hono` and `@wyrly/next`
include `@module` on `mod.ts` but are omitted from `doc:lint` because `deno doc --lint` reports
`private-type-ref` on Hono/Next framework types in public `Token<>` exports. For Deno-only checks
locally, use **`deno task ci:deno`**.

## Consumer imports

### Deno / JSR

```jsonc
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^2.0.0"
  }
}
```

```ts
import { createContainer, token } from "@wyrly/core";
```

### Node / npm

```sh
npm install @wyrly/core
```

```ts
import { createContainer, token } from "@wyrly/core";
```

Install adapters as needed (for example `@wyrly/next`). Keep the same major version as
`@wyrly/core`.

**`@wyrly/fresh`:** Use JSR only (`jsr:@wyrly/fresh`). Fresh 2.x depends on `jsr:@fresh/core`; there
is no `@fresh/core` on npm.

## npm build (dnt)

npm packages are built with [dnt](https://github.com/denoland/dnt) from Deno sources. Output is
**ESM only** (`scriptModule: false`) under `packages/*/npm/` (gitignored).

**Package README and keywords:** Edit `packages/<name>/README.md` (English, shown on npm) and
`README.ja.md` (Japanese, GitHub only) before release. Metadata (`keywords`, `homepage`, `bugs`)
lives in [`scripts/dnt/package-metadata.ts`](scripts/dnt/package-metadata.ts). `deno task build:npm`
copies `README.md` into each `packages/*/npm/` and merges metadata into `package.json`.

```sh
deno task check:npm-readme   # verify all six packages have README.md + README.ja.md
deno task build:npm          # five npm packages (core first, then adapters; fresh excluded)
deno task build:npm:core     # core only
```

Adapter builds require a prior core npm build (`packages/core/npm/`).

## Local checks

```sh
deno task ci:deno    # Deno only (fast; no Node/Bun required)
deno task test:compat # runtime smoke tests for Node/npm, Bun, and Cloudflare Workers
deno task ci          # full gate: ci:deno + JSR dry-run + test:compat + npm dry-run (needs Node 20+ and Bun)
```

## Manual release (local)

Prefer **tag push → GitHub Actions** for production releases. For local publishes:

1. Bump `version` in all six `packages/*/deno.json` files.
2. Update [CHANGELOG.md](./CHANGELOG.md).
3. `deno task ci` (requires Node 20+ and Bun).
4. Apply the [JSR Runtime checklist](#jsr-runtime-checklist) on jsr.io if runtime support changed.
5. **JSR:** `deno task publish:jsr` — opens the browser to approve each package.
6. `deno task build:npm` (if not already built; `ci` runs `test:compat` which builds npm artifacts).
7. **npm:** `deno task publish:npm` after `npm login` to the `@wyrly` org (**core first** is
   enforced by task order). Trusted Publishing applies only in GitHub Actions.

8. Tag `vX.Y.Z` and push (or push the tag only and let CI publish).

## GitHub Actions

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml): on push/PR to `main` → `deno task ci`
(Deno + Node 20 + Bun).

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml): tag `v*` or `workflow_dispatch`
→ `deno task ci` → `build:npm` → JSR publish (OIDC) → `deno task publish:npm:ci` (Trusted
Publishing + `--provenance`, Node 24.x).

**No repository secrets are required** when JSR repository links and npm Trusted Publishers are
configured.

The workflow sets `permissions: id-token: write` for OIDC and uses Node **24.x** so the runner ships
**npm 11.5.1+** (Node 22 images bundle npm 10.x).

## Package notes

- Adapters use `scripts/dnt/pkg.*.json` for dnt (without `jsr:@wyrly/core` in imports) so workspace
  resolution does not confuse the npm bundler.
- Published `@wyrly/core` dependency on adapters is `^VERSION` (not `file:`).
- Public exports must satisfy [JSR slow types](https://jsr.io/docs/about-slow-types) (explicit
  `Token<T>` on adapter tokens; no `--allow-slow-types` in publish tasks).

## Troubleshooting

| Issue                                                                             | Action                                                                                                                                                     |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adapter dnt build fails on `@wyrly/core`                                          | Run `deno task build:npm:core` first                                                                                                                       |
| npm 404 for `@fresh/core` or `@wyrly/fresh`                                       | Expected; Fresh stack uses JSR (`jsr:@wyrly/fresh`)                                                                                                        |
| JSR publish fails in Actions with auth error                                      | Link `OWNER/REPO` on each package’s JSR Settings page                                                                                                      |
| JSR `globalTypeAugmentation` / `modifying global types`                           | Do not use `declare global` or `declare module` in published sources; use exported types (`ExpressRequestWithDI`, `HonoDIVariables`, `FreshDIState`, etc.) |
| npm publish `404` / “not in this registry” in Actions (provenance may still sign) | Use **Node 24.x** in CI so **npm ≥ 11.5.1** (Node 22 → npm 10.x gives a misleading 404). Re-run after fixing `publish.yml`                                 |
| npm publish `403` in Actions                                                      | Check Trusted Publisher: repo `valid-lab/wyrly`, workflow `publish.yml`, **Allow npm publish**; Node 24+ / npm 11.5.1+                                     |
| `Automatic provenance generation not supported for provider: null` (local)        | Use `deno task publish:npm` locally (no `--provenance`). Use `deno task publish:npm:ci` only in GitHub Actions with Trusted Publishing                     |
| npm provenance / trusted publish errors (CI)                                      | Check Trusted Publisher settings; workflow must run `publish:npm:ci`                                                                                       |
| Low JSR Score (readme / examples / symbol docs)                                   | Add `@module` + `@example` in `packages/*/mod.ts`; run `deno task doc:lint`; document exports with JSDoc                                                   |
| JSR Score “slow types” (0/5)                                                      | Run `deno lint --rules-include=no-slow-types packages/`; fix explicit types; publish without `--allow-slow-types`                                          |
| JSR Score runtime / description (0/1 each)                                        | Set **Description** and **Runtime compatibility** in JSR package Settings (not in `deno.json`)                                                             |
| `deno task test:compat` fails                                                     | Run `deno task build:npm:compat` first; ensure Node/npm and Bun are installed; see `compat/node`, `compat/bun`, and `compat/workers`                       |
