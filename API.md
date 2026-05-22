# Public API (v1.0)

Japanese: [API.ja.md](./API.ja.md)

This document lists the **stable public exports** for Wyrly DI v1.0.0. Anything not listed here is not part of the semver guarantee (internal modules, deep imports).

## Versioning policy

Packages follow [Semantic Versioning](https://semver.org/) from **1.0.0**:

- **Major**: removing or breaking a symbol listed below (signature or runtime behavior guaranteed by docs)
- **Minor**: new exports or backward-compatible additions
- **Patch**: bug fixes without API changes

Source of truth: each package’s [`mod.ts`](./packages/core/mod.ts) re-exports.

---

## `@wyrly/core`

Entry: [`packages/core/mod.ts`](./packages/core/mod.ts)

### Functions

| Export | Description |
|--------|-------------|
| `token` | Create a typed injection token |
| `Injectable` | Standard decorator for explicit `deps` / `lifetime` |
| `createContainer` | Create the root DI container |
| `graphToJson` | Serialize `DependencyGraph` to JSON |
| `graphToDot` | Serialize graph to DOT |
| `graphToMermaid` | Serialize graph to Mermaid |
| `validateNormalizedProviders` | Validate provider registry (advanced; usually `container.validate()`) |
| `errorMessage` | Localized runtime error text |
| `validationMessage` | Localized validation issue text |
| `normalizeLocaleTag` | Normalize locale tag to `en` / `ja` |
| `resolveLocale` | Resolve locale from options / environment |
| `providerNotFoundHint` | Hint string for missing providers |
| `lifetimeViolationHint` | Hint string for lifetime violations |

### Types

| Export | Description |
|--------|-------------|
| `Token`, `ClassToken`, `InjectionToken` | Token types |
| `Lifetime` | `"singleton"` \| `"scoped"` \| `"transient"` |
| `Container` | Root container interface |
| `Scope` | Request / nested scope interface |
| `Provider`, `ClassProvider`, `ValueProvider`, `FactoryProvider`, `ExistingProvider` | Provider shapes |
| `DependencyGraph`, `DependencyNode`, `DependencyEdge` | Inspect API graph types |
| `GraphToJsonOptions` | Options for `graphToJson` |
| `ValidateOptions`, `ValidationResult`, `ValidationIssue` | Validate API types |
| `Locale`, `ValidationMessageCode`, `ErrorMessageKind` | i18n types |
| `DEFAULT_LOCALE` | Default locale constant |

### Classes (errors)

| Export |
|--------|
| `ProviderNotFoundError` |
| `CircularDependencyError` |
| `InvalidProviderError` |
| `ScopeDisposedError` |
| `LifetimeViolationError` |
| `DuplicateProviderError` |

### `Container` methods (via `createContainer()`)

| Method | Description |
|--------|-------------|
| `register` | Register a provider |
| `resolve` | Resolve from root (singleton / transient) |
| `createScope` | Create a child scope |
| `override` | Replace a registered provider |
| `inspect` | Export dependency graph |
| `validate` | Run design-time checks on the registry |

### `Scope` methods

| Method | Description |
|--------|-------------|
| `resolve` | Resolve within scope |
| `register` | Scope-local provider |
| `set` | Scope-local value |
| `dispose` | Dispose scoped instances |
| `isDisposed` | Whether scope was disposed |

---

## `@wyrly/express`

Entry: [`packages/express/mod.ts`](./packages/express/mod.ts)

| Export | Description |
|--------|-------------|
| `diMiddleware` | Express middleware: one scope per request, `req.di` |
| `ExpressRequestToken` | Typed token for `Request` |
| `ExpressResponseToken` | Typed token for `Response` |
| `ExpressRequestWithDI` | `Request & { di: Scope }` — use in route handlers for typed `req.di` |

JSR does not allow `declare global` in published packages. Optionally augment `Express.Request` in a project-local `.d.ts` if you prefer ambient typing.

---

## `@wyrly/hono`

Entry: [`packages/hono/mod.ts`](./packages/hono/mod.ts)

| Export | Description |
|--------|-------------|
| `di` | Hono middleware: `c.set("di", scope)` |
| `HonoContextToken` | Typed token for Hono context |
| `RequestToken` | Typed token for raw `Request` |

---

## `@wyrly/fresh`

Entry: [`packages/fresh/mod.ts`](./packages/fresh/mod.ts)

| Export | Description |
|--------|-------------|
| `di` | Fresh middleware: `ctx.state.di` |
| `withDI` | Per-route handler wrapper with scope |
| `FreshContextToken` | Typed token for Fresh `Context` |
| `RequestToken` | Typed token for `Request` |

### Types

| Export |
|--------|
| `FreshDIState` |
| `FreshDIOptions` |
| `FreshDIContext` |
| `FreshDIHandler` |

---

## `@wyrly/graphql`

Entry: [`packages/graphql/mod.ts`](./packages/graphql/mod.ts)

| Export | Description |
|--------|-------------|
| `createGraphQLDIContext` | Build GraphQL context with `di` scope |
| `GraphQLRequestToken` | Typed token for `Request` |
| `GraphQLResponseToken` | Typed token for `Response` |

### Types

| Export |
|--------|
| `GraphQLDIContext` |
| `CreateGraphQLDIContextOptions` |

---

## `@wyrly/next`

Entry: [`packages/next/mod.ts`](./packages/next/mod.ts)

| Export | Description |
|--------|-------------|
| `withDI` | Next.js Route Handler wrapper |
| `withActionDI` | Server Action wrapper |
| `createServerDI` | Server Components helper (`getDI()` per request) — see [guides/SERVER_COMPONENTS.md](./guides/SERVER_COMPONENTS.md) |
| `NextRequestToken` | Typed token for `NextRequest` |

### Types

| Export |
|--------|
| `RouteHandlerContext` |
| `WithDIOptions` |
| `CreateServerDIOptions` |
| `AfterScheduler` |
