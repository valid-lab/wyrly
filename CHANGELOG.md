# Changelog

Japanese: [CHANGELOG.ja.md](./CHANGELOG.ja.md)

All notable changes to the `@wyrly/*` packages in this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/) from **1.0.0**.

## [Unreleased]

## [2.2.1] - 2026-05-25

### Fixed

- **`@wyrly/fastify`**: call `done()` in the synchronous `onRequest` hook so the request pipeline
  continues (fixes hung requests and HTTP 408 Client Timeout).

## [2.2.0] - 2026-05-25

### Added

- **`@wyrly/yoga`** — GraphQL Yoga 5 inbound adapter: `yogaDIPlugin`, `yogaContext`,
  `createYogaDIContext` (delegates to `@wyrly/graphql`), re-exported GraphQL tokens.
- **`@wyrly/apollo`** — Apollo Server 4+ inbound adapter: `apolloDIPlugin`,
  `createApolloDIContext`, `toFetchRequest`, Apollo/GraphQL tokens.
- **`@wyrly/fastify`** — Fastify 5 inbound adapter: `diPlugin`, `getDI`, request/reply tokens
  (uses `fastify-plugin` for root-level hooks).
- Example `examples/fastify-api`.
- Example `examples/yoga-graphql` migrated to `@wyrly/yoga`.
- Example `examples/apollo-graphql` migrated to `@wyrly/apollo`.
- Example `examples/apollo-express-graphql` — Express + Apollo + scoped DI.
- [guides/GRAPHQL_DISPOSE.md](./guides/GRAPHQL_DISPOSE.md): official Yoga and Apollo plugin sections.

## [2.1.0] - 2026-05-25

### Added

- `@wyrly/core` `Scope.createChildScope()` for nested request units of work.
- `@wyrly/core` `Scope.dispose({ onError })` for framework-agnostic disposal error hooks.
- `@wyrly/core` `validate()` rules: `transitive_singleton_depends_on_scoped` (error),
  `injectable_deps_mismatch` and `injectable_lifetime_mismatch` (warnings).
- `ScopeHasActiveChildrenError` when disposing a parent scope before its children.
- Guides: [guides/GRAPHQL_DISPOSE.md](./guides/GRAPHQL_DISPOSE.md) (en/ja).
- Examples: `examples/yoga-graphql`, `examples/apollo-graphql`.

### Changed

- Child scopes resolve parent scoped instances and `set()` values; new scoped instances are created
  on the resolving scope only.
- `@wyrly/express` `diMiddleware` passes disposal errors to `scope.dispose({ onError })`.

## [2.0.0] - 2026-05-23

### Changed

- **Breaking**: `FactoryProvider.deps` is now required. Factory dependencies are resolved from the
  declared tokens and passed to `useFactory(scope, ...deps)` so `inspect()` / `validate()` can see
  the same dependency graph used at runtime.
- DDD examples now keep DI tokens in `composition/tokens.ts` instead of `domain/`, and wire use cases
  from `composition/container.ts`.
- `examples/next-ddd`, `examples/fresh-routes`, and `examples/express-api` now demonstrate `UserId`
  value objects and request-derived `CurrentUser` values.

### Added

- `@wyrly/express` `diMiddleware(container, { onDisposeError })` for observing asynchronous scope
  disposal failures after `finish` / `close`.

## [1.0.6] - 2026-05-22

### Added

- `deno task ci:deno` (Deno-only checks) and full `deno task ci` (adds JSR dry-run, `test:compat`,
  npm dry-run)
- [CONTRIBUTING.md](./CONTRIBUTING.md) and [SECURITY.md](./SECURITY.md)
- CI / JSR / npm / License badges on README

### Changed

- GitHub Actions [ci.yml](./.github/workflows/ci.yml): single job runs `deno task ci` (Deno + Node +
  Bun)
- [publish.yml](./.github/workflows/publish.yml): pre-publish `deno task ci` includes compat;
  removed duplicate dry-run steps
- `@wyrly/hono` / `@wyrly/next`: package-public types (`HonoContext`, `HonoMiddlewareHandler`,
  `NextRequest`); `doc:lint` still omits these two packages (framework `private-type-ref`)
- [PUBLISHING.md](./PUBLISHING.md): JSR Runtime checklist per package (aligned with compat CI)
- Documentation: aligned en/ja language-link placement; English docs link only to sibling `*.ja.md`;
  removed unreleased Pro CLI references from OSS docs
- Git hooks: Lefthook (`lefthook.yml`, `deno task setup:hooks`)

## [1.0.5] - 2026-05-22

### Added

- Per-package `README.md` / `README.ja.md` for all six `@wyrly/*` packages (npm shows English
  README)
- npm `package.json` metadata: `keywords`, `homepage`, `bugs` via
  [`scripts/dnt/package-metadata.ts`](scripts/dnt/package-metadata.ts); `deno task check:npm-readme`
- Runtime compat smoke tests: `compat/node`, `compat/bun`, `compat/workers` (see
  `deno task test:compat`)

### Changed

- `@wyrly/core` README: Deno (JSR) install and runtime table first; npm keywords include `deno`,
  `jsr`
- npm build: no `@deno/shim-deno` dependency; `i18n` uses portable env lookup for Cloudflare
  Workers/Bun

## [1.0.4] - 2026-05-22

### Changed

- JSR documentation: `@module` + `@example` on all six `packages/*/mod.ts`; JSDoc on public exports
  in `@wyrly/core`
- Adapter tokens use explicit `Token<T>` annotations (no `--allow-slow-types` on publish)
- CI: `deno task doc:lint`, `no-slow-types` lint; publish dry-run without `--allow-slow-types`

### Fixed

- Publish workflow uses Node **24.x** for npm Trusted Publishing (npm ≥ 11.5.1)

## [1.0.3] - 2026-05-22

### Changed

- Release **1.0.3** so JSR (6 packages) and npm (5 packages) receive the same artifacts after
  partial **1.0.2** publishes (registries do not allow overwriting an existing version)
- `examples/express-api` and `examples/hono-api` updated for exported adapter types
- `README.ja.md` aligned with `README.md` (full Japanese README)

## [1.0.2] - 2026-05-22

### Fixed

- **`@wyrly/express`**: remove `declare global` (disallowed on JSR); export `ExpressRequestWithDI`
  and `asExpressRequestWithDI` instead
- **`@wyrly/hono`**: remove `declare module "hono"` (disallowed on JSR); export `HonoDIVariables`,
  `getDI`, and `diVariableKey` instead

## [1.0.1] - 2026-05-22

### Fixed

- npm package metadata: `repository.url` now points to `https://github.com/valid-lab/wyrly` (was
  `wyrly/wyrly`); monorepo `directory` is `packages/<name>`

## [1.0.0] - 2026-05-21

### Added

- **`@wyrly/core`**: typed `token()`, `createContainer()`, `@Injectable`, explicit providers
  (`useClass`, `useValue`, `useFactory`, `useExisting`), singleton / scoped / transient lifetimes,
  `override`, scope `set` / `register`, `dispose`, circular dependency detection, resolve-time
  lifetime violations, `inspect()`, `validate()`, graph export (`graphToJson`, `graphToDot`,
  `graphToMermaid`), localized errors (`en` / `ja`)
- **Adapters**: `@wyrly/express`, `@wyrly/hono`, `@wyrly/fresh`, `@wyrly/graphql`, `@wyrly/next`
  with request-scope integration
- **Examples**: 10 runnable samples under `examples/` (core + each adapter)
- **Documentation**: [API.md](./API.md) (frozen public surface), contributor [AGENT.md](./AGENT.md)
- JSR publishing pipeline (`deno publish`, `deno task publish:dry-run`,
  [PUBLISHING.md](./PUBLISHING.md))
- npm publishing via [dnt](https://github.com/denoland/dnt) (`deno task build:npm`,
  `deno task publish:npm` → five `@wyrly/*` packages on registry.npmjs.org; `@wyrly/fresh` remains
  JSR-only)
- [guides/SERVER_COMPONENTS.md](./guides/SERVER_COMPONENTS.md) for Next.js App Router Server
  Components
- GraphQL DataLoader pattern documentation in
  [examples/graphql-request](./examples/graphql-request/)

### Changed

- GitHub Actions publish uses **JSR OIDC** and **npm Trusted Publishing**; see one-time registry
  checklist in [PUBLISHING.md](./PUBLISHING.md)
- `deno task publish:npm:ci` adds `--provenance` for npm attestations in GitHub Actions; local
  `publish:npm` omits it; CI uses Node 22.x
- README installation covers JSR, npm, and workspace development

### Notes

- Standard TypeScript decorators only; no `reflect-metadata`, legacy decorators, or parameter
  decorators
- No automatic glob scan; composition-root registration is required

### Known limitations

- No first-class `resolveAsync` (async factory results are not fully modeled as async DI)

[2.1.0]: https://github.com/valid-lab/wyrly/releases/tag/v2.1.0
[2.0.0]: https://github.com/valid-lab/wyrly/releases/tag/v2.0.0
[1.0.6]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.6
[1.0.5]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.5
[1.0.4]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.4
[1.0.3]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.3
[1.0.2]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.2
[1.0.1]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.1
[1.0.0]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.0
