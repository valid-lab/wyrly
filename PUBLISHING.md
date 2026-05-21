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
- **Node.js 20.x** + **npm** (npm publish and dnt build)
- **JSR**: `@wyrly` scope and [JSR token](https://jsr.io/docs/trust-and-security#publish-tokens) → `JSR_TOKEN`
- **npm**: `@wyrly` org publish access and [npm token](https://docs.npmjs.com/creating-and-viewing-access-tokens) → `NPM_TOKEN` / `NODE_AUTH_TOKEN`

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

## Manual release

1. Bump `version` in all six `packages/*/deno.json` files.
2. Update [CHANGELOG.md](./CHANGELOG.md) and [CHANGELOG.ja.md](./CHANGELOG.ja.md).
3. `deno task ci`
4. `deno task publish:dry-run` (JSR)
5. `deno task publish:jsr` with `JSR_TOKEN`
6. `deno task build:npm`
7. `deno task publish:npm:dry-run`
8. `deno task publish:npm` with `NODE_AUTH_TOKEN` / `NPM_TOKEN` (**core first** is enforced by task order)
9. Tag `vX.Y.Z` and push

## GitHub Actions

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml): tag or `workflow_dispatch` → CI → JSR publish → `build:npm` → npm dry-run → npm publish.

Secrets: `JSR_TOKEN`, `NPM_TOKEN`.

## Package notes

- Adapters use `scripts/dnt/pkg.*.json` for dnt (without `jsr:@wyrly/core` in imports) so workspace resolution does not confuse the npm bundler.
- Published `@wyrly/core` dependency on adapters is `^VERSION` (not `file:`).
- JSR publish may use `--allow-slow-types` until adapter tokens get explicit `Token<T>` annotations.

## Troubleshooting

| Issue | Action |
|-------|--------|
| Adapter dnt build fails on `@wyrly/core` | Run `deno task build:npm:core` first |
| npm 404 for `@fresh/core` or `@wyrly/fresh` | Expected; Fresh stack uses JSR (`jsr:@wyrly/fresh`) |
| npm publish auth failed | Check `NPM_TOKEN` and `@wyrly` org access |
