# Changelog

Japanese: [CHANGELOG.ja.md](./CHANGELOG.ja.md)

All notable changes to the `@wyrly/*` packages in this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/) from **1.0.0**.

## [Unreleased]

## [1.0.4] - 2026-05-22

### Changed

- JSR documentation: `@module` + `@example` on all six `packages/*/mod.ts`; JSDoc on public exports in `@wyrly/core`
- Adapter tokens use explicit `Token<T>` annotations (no `--allow-slow-types` on publish)
- CI: `deno task doc:lint`, `no-slow-types` lint; publish dry-run without `--allow-slow-types`

### Fixed

- Publish workflow uses Node **24.x** for npm Trusted Publishing (npm ≥ 11.5.1)

## [1.0.3] - 2026-05-22

### Changed

- Release **1.0.3** so JSR (6 packages) and npm (5 packages) receive the same artifacts after partial **1.0.2** publishes (registries do not allow overwriting an existing version)
- `examples/express-api` and `examples/hono-api` updated for exported adapter types
- `README.ja.md` aligned with `README.md` (full Japanese README)

## [1.0.2] - 2026-05-22

### Fixed

- **`@wyrly/express`**: remove `declare global` (disallowed on JSR); export `ExpressRequestWithDI` and `asExpressRequestWithDI` instead
- **`@wyrly/hono`**: remove `declare module "hono"` (disallowed on JSR); export `HonoDIVariables`, `getDI`, and `diVariableKey` instead

## [1.0.1] - 2026-05-22

### Fixed

- npm package metadata: `repository.url` now points to `https://github.com/valid-lab/wyrly` (was `wyrly/wyrly`); monorepo `directory` is `packages/<name>`

## [1.0.0] - 2026-05-21

### Added

- **`@wyrly/core`**: typed `token()`, `createContainer()`, `@Injectable`, explicit providers (`useClass`, `useValue`, `useFactory`, `useExisting`), singleton / scoped / transient lifetimes, `override`, scope `set` / `register`, `dispose`, circular dependency detection, resolve-time lifetime violations, `inspect()`, `validate()`, graph export (`graphToJson`, `graphToDot`, `graphToMermaid`), localized errors (`en` / `ja`)
- **Adapters**: `@wyrly/express`, `@wyrly/hono`, `@wyrly/fresh`, `@wyrly/graphql`, `@wyrly/next` with request-scope integration
- **Examples**: 10 runnable samples under `examples/` (core + each adapter)
- **Documentation**: [API.md](./API.md) (frozen public surface), contributor [AGENT.md](./AGENT.md)
- JSR publishing pipeline (`deno publish`, `deno task publish:dry-run`, [PUBLISHING.md](./PUBLISHING.md))
- npm publishing via [dnt](https://github.com/denoland/dnt) (`deno task build:npm`, `deno task publish:npm` → five `@wyrly/*` packages on registry.npmjs.org; `@wyrly/fresh` remains JSR-only)
- [guides/SERVER_COMPONENTS.md](./guides/SERVER_COMPONENTS.md) for Next.js App Router Server Components
- GraphQL DataLoader pattern documentation in [examples/graphql-request](./examples/graphql-request/)

### Changed

- GitHub Actions publish uses **JSR OIDC** and **npm Trusted Publishing**; see one-time registry checklist in [PUBLISHING.md](./PUBLISHING.md)
- `deno task publish:npm:ci` adds `--provenance` for npm attestations in GitHub Actions; local `publish:npm` omits it; CI uses Node 22.x
- README installation covers JSR, npm, and workspace development

### Notes

- Standard TypeScript decorators only; no `reflect-metadata`, legacy decorators, or parameter decorators
- No automatic glob scan; composition-root registration is required

### Known limitations

- No first-class `resolveAsync` (async factory results are not fully modeled as async DI)

[1.0.4]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.4
[1.0.3]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.3
[1.0.2]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.2
[1.0.1]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.1
[1.0.0]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.0
