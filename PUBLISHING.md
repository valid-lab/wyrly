# Publishing `@wyrly/*`

Japanese: [PUBLISHING.ja.md](./PUBLISHING.ja.md)

This repository publishes **six packages to JSR** (Deno) and **five to npm** (Node / bundlers). `@wyrly/fresh` is **JSR-only** because Fresh 2.x has no npm distribution (`jsr:@fresh/core`).

| Package          | JSR                  | npm (registry.npmjs.org) |
| ---------------- | -------------------- | ------------------------ |
| `@wyrly/core`    | `jsr:@wyrly/core`    | `@wyrly/core`            |
| `@wyrly/express` | `jsr:@wyrly/express` | `@wyrly/express`         |
| `@wyrly/hono`    | `jsr:@wyrly/hono`    | `@wyrly/hono`            |
| `@wyrly/fresh`   | `jsr:@wyrly/fresh`   | — (JSR only)             |
| `@wyrly/graphql` | `jsr:@wyrly/graphql` | `@wyrly/graphql`         |
| `@wyrly/next`    | `jsr:@wyrly/next`    | `@wyrly/next`            |

All packages share the same **semver** in each `packages/*/deno.json` and are released together under a git tag `vX.Y.Z`.

## Prerequisites

- **Deno 2.x** (development and JSR publish)
- **Node.js 24.x** + **npm 11.5.1+** in CI (Trusted Publishing; Node 20.x+ is fine for local dnt builds)
- **JSR**: `@wyrly` scope on [jsr.io](https://jsr.io/)
- **npm**: `@wyrly` organization on [npmjs.com](https://www.npmjs.com/) (free public packages)

**GitHub Actions does not use long-lived tokens.** CI authenticates via [JSR OIDC](https://jsr.io/docs/publishing-packages#publishing-from-github-actions) and [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/). Complete the one-time registry setup below before the first tagged release.

## One-time registry setup (before first CI publish)

Replace `OWNER/REPO` with this repository (for example `your-org/wyrly-oss`).

### JSR — link GitHub repository (6 packages)

For each package, create it at [jsr.io/new](https://jsr.io/new) if needed, then open **Settings → GitHub repository**, enter `OWNER/REPO`, and click **Link**:

- [ ] `@wyrly/core`
- [ ] `@wyrly/express`
- [ ] `@wyrly/hono`
- [ ] `@wyrly/fresh`
- [ ] `@wyrly/graphql`
- [ ] `@wyrly/next`

The publish workflow must be [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) (filename `publish.yml`).

### npm — Trusted Publisher (5 packages)

Under the **`wyrly`** org, register **Trusted Publisher → GitHub Actions** for each npm package (or from org settings when the package does not exist yet):

| Field | Value |
| ----- | ----- |
| Repository | `OWNER/REPO` |
| Workflow filename | `publish.yml` |
| Environment | *(leave empty unless you use a GitHub Environment)* |

Packages:

- [ ] `@wyrly/core`
- [ ] `@wyrly/express`
- [ ] `@wyrly/hono`
- [ ] `@wyrly/graphql`
- [ ] `@wyrly/next`

(`@wyrly/fresh` is not published to npm.)

### JSR Score (manual, per package Settings)

After each release, on [jsr.io](https://jsr.io/) open **Settings** for every `@wyrly/*` package:

| Field | Suggested value |
| ----- | ---------------- |
| **Description** | One sentence (≤250 chars). Example core: `Explicit DI for modern TypeScript — typed tokens, standard decorators, request scopes.` |
| **Runtime compatibility** | **Deno: Supported**, **Node.js: Supported** (adapters also publish to npm; `@wyrly/fresh` is Deno/Fresh only). Leave Cloudflare Workers / Bun as **Unknown** unless you verify. |
| **Readme source** | Default (module doc on Overview when `@module` is present in `mod.ts`) |

Code-side checks in CI: `deno task doc:lint` (module docs on core + express + graphql + fresh), `deno lint` with `no-slow-types`, and `deno task publish:dry-run` without `--allow-slow-types`.

## Consumer imports

### Deno / JSR

```jsonc
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^1.0.0"
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

Install adapters as needed (for example `@wyrly/next`). Keep the same major version as `@wyrly/core`.

**`@wyrly/fresh`:** Use JSR only (`jsr:@wyrly/fresh`). Fresh 2.x depends on `jsr:@fresh/core`; there is no `@fresh/core` on npm.

## npm build (dnt)

npm packages are built with [dnt](https://github.com/denoland/dnt) from Deno sources. Output is **ESM only** (`scriptModule: false`) under `packages/*/npm/` (gitignored).

```sh
deno task build:npm          # five npm packages (core first, then adapters; fresh excluded)
deno task build:npm:core     # core only
```

Adapter builds require a prior core npm build (`packages/core/npm/`).

## Local dry-run

```sh
deno task ci
deno task publish:dry-run    # JSR
deno task build:npm
deno task publish:npm:dry-run
```

## Manual release (local)

Prefer **tag push → GitHub Actions** for production releases. For local publishes:

1. Bump `version` in all six `packages/*/deno.json` files.
2. Update [CHANGELOG.md](./CHANGELOG.md) and [CHANGELOG.ja.md](./CHANGELOG.ja.md).
3. `deno task ci`
4. `deno task publish:dry-run` (JSR)
5. **JSR:** `deno task publish:jsr` — opens the browser to approve each package.
6. `deno task build:npm`
7. `deno task publish:npm:dry-run`
8. **npm:** `deno task publish:npm` after `npm login` to the `@wyrly` org (**core first** is enforced by task order). Trusted Publishing applies only in GitHub Actions.

9. Tag `vX.Y.Z` and push (or push the tag only and let CI publish).

## GitHub Actions

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml): tag `v*` or `workflow_dispatch` → CI → JSR publish (OIDC) → `build:npm` → npm dry-run → `deno task publish:npm:ci` (Trusted Publishing + `--provenance`).

**No repository secrets are required** when JSR repository links and npm Trusted Publishers are configured.

The workflow sets `permissions: id-token: write` for OIDC and uses Node **24.x** so the runner ships **npm 11.5.1+** (Node 22 images bundle npm 10.x).

## Package notes

- Adapters use `scripts/dnt/pkg.*.json` for dnt (without `jsr:@wyrly/core` in imports) so workspace resolution does not confuse the npm bundler.
- Published `@wyrly/core` dependency on adapters is `^VERSION` (not `file:`).
- Public exports must satisfy [JSR slow types](https://jsr.io/docs/about-slow-types) (explicit `Token<T>` on adapter tokens; no `--allow-slow-types` in publish tasks).

## Troubleshooting

| Issue | Action |
|-------|--------|
| Adapter dnt build fails on `@wyrly/core` | Run `deno task build:npm:core` first |
| npm 404 for `@fresh/core` or `@wyrly/fresh` | Expected; Fresh stack uses JSR (`jsr:@wyrly/fresh`) |
| JSR publish fails in Actions with auth error | Link `OWNER/REPO` on each package’s JSR Settings page |
| JSR `globalTypeAugmentation` / `modifying global types` | Do not use `declare global` or `declare module` in published sources; use exported types (`ExpressRequestWithDI`, `HonoDIVariables`, `FreshDIState`, etc.) |
| npm publish `404` / “not in this registry” in Actions (provenance may still sign) | Use **Node 24.x** in CI so **npm ≥ 11.5.1** (Node 22 → npm 10.x gives a misleading 404). Re-run after fixing `publish.yml` |
| npm publish `403` in Actions | Check Trusted Publisher: repo `valid-lab/wyrly`, workflow `publish.yml`, **Allow npm publish**; Node 24+ / npm 11.5.1+ |
| `Automatic provenance generation not supported for provider: null` (local) | Use `deno task publish:npm` locally (no `--provenance`). Use `deno task publish:npm:ci` only in GitHub Actions with Trusted Publishing |
| npm provenance / trusted publish errors (CI) | Check Trusted Publisher settings; workflow must run `publish:npm:ci` |
| Low JSR Score (readme / examples / symbol docs) | Add `@module` + `@example` in `packages/*/mod.ts`; run `deno task doc:lint`; document exports with JSDoc |
| JSR Score “slow types” (0/5) | Run `deno lint --rules-include=no-slow-types packages/`; fix explicit types; publish without `--allow-slow-types` |
| JSR Score runtime / description (0/1 each) | Set **Description** and **Runtime compatibility** in JSR package Settings (not in `deno.json`) |
