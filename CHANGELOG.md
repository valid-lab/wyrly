# Changelog

Japanese: [CHANGELOG.ja.md](./CHANGELOG.ja.md)

All notable changes to the `@wyrly/*` packages in this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/) from **1.0.0**.

## [1.0.0] - 2026-05-21

### Added

- **`@wyrly/core`**: typed `token()`, `createContainer()`, `@Injectable`, explicit providers (`useClass`, `useValue`, `useFactory`, `useExisting`), singleton / scoped / transient lifetimes, `override`, scope `set` / `register`, `dispose`, circular dependency detection, resolve-time lifetime violations, `inspect()`, `validate()`, graph export (`graphToJson`, `graphToDot`, `graphToMermaid`), localized errors (`en` / `ja`)
- **Adapters**: `@wyrly/express`, `@wyrly/hono`, `@wyrly/fresh`, `@wyrly/graphql`, `@wyrly/next` with request-scope integration
- **Examples**: 10 runnable samples under `examples/` (core + each adapter)
- **Documentation**: [API.md](./API.md) (frozen public surface), contributor [AGENT.md](./AGENT.md)

### Notes

- Standard TypeScript decorators only; no `reflect-metadata`, legacy decorators, or parameter decorators
- No automatic glob scan; composition-root registration is required

### Known limitations

- No first-class `resolveAsync` (async factory results are not fully modeled as async DI)
- No HTML dependency-graph export in core (use external tooling if needed)
- No built-in CLI in this repository

[1.0.0]: https://github.com/your-org/wyrly/releases/tag/v1.0.0
