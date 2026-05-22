# AGENT.md

Contributor and AI agent guide for the **Wyrly DI open-source repository** (`@wyrly/*` packages and `examples/`).

Read this file first when changing code in **this repository only**. Follow the rules below for implementation, fixes, and reviews.

## 0. Repository and toolchain (Deno)

TypeScript code is managed in a **Deno workspace** at the repository root ([`deno.jsonc`](deno.jsonc)). Workspace members are `packages/*` and `examples/*`.

Place each package under `packages/<name>/` and publish as `@wyrly/*` (see [README.md](README.md)). Use **bare specifiers** between packages (for example `import … from "@wyrly/core"`), not relative paths into other packages. Deno workspace resolution handles the rest. In VS Code, `.vscode/settings.json` enables the Deno extension under `packages/`.

Common tasks: `deno task check`, `deno task test`, `deno task example:*` (see `deno.jsonc`).

## 1. Product purpose

Wyrly DI is a dependency injection toolkit for the TypeScript 7 era: standard decorators, type safety, explicit dependencies, and analyzable wiring.

It is not only a DI container. The goal is a development foundation that keeps dependency design safe in TypeScript applications.

## 2. Core concepts

```txt
Wyrly DI
for explicit, analyzable, type-safe application architecture.
```

Principles:

```txt
Explicit over magic.
Inspectable over hidden.
Standard decorators over legacy decorators.
Typed tokens over string tokens.
Composition root over auto scan.
Adapters over framework coupling.
```

## 3. Non-negotiable rules

### 3.1 Do not use `reflect-metadata`

Forbidden:

```ts
import "reflect-metadata";
```

Forbidden:

```ts
Reflect.getMetadata(...)
```

### 3.2 Do not rely on `emitDecoratorMetadata`

Do not infer constructor parameters from design-time type metadata.

### 3.3 Do not use legacy parameter decorators

Forbidden:

```ts
class UserService {
  constructor(@Inject(UserRepositoryToken) repo: UserRepository) {}
}
```

Use standard decorators and explicit dependencies:

```ts
@Injectable({
  deps: [UserRepositoryToken],
})
class UserService {
  constructor(private readonly repo: UserRepository) {}
}
```

### 3.4 Keep framework code out of core

`@wyrly/core` must not depend on:

- Express
- Hono
- Fresh
- Next.js
- GraphQL
- Node.js-specific APIs
- `fs`
- `path`
- `process`
- `AsyncLocalStorage`

Put framework-specific behavior in adapter packages.

### 3.5 No auto-scan registration

Forbidden:

```ts
container.scan("./**/*.ts");
```

Reasons:

- Poor fit with bundlers
- Poor fit with Edge runtimes
- Harder static analysis
- Harder for AI agents to read dependency structure

Register dependencies explicitly in a composition root.

### 3.6 Prefer typed tokens over raw strings

Recommended:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");
```

Discouraged:

```ts
"UserRepository";
```

## 4. Recommended API usage

### 4.1 token

```ts
export const UserRepositoryToken = token<UserRepository>("UserRepository");
```

### 4.2 Injectable

```ts
@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

### 4.3 register

```ts
container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
  lifetime: "scoped",
});
```

### 4.4 resolve

```ts
const usecase = scope.resolve(GetUserUseCase);
```

### 4.5 scope

```ts
const scope = container.createScope();

try {
  const usecase = scope.resolve(GetUserUseCase);
} finally {
  await scope.dispose();
}
```

## 5. Package layout

This repository:

```txt
packages/
  core/
    mod.ts
    token.ts
    container.ts
    scope.ts
    provider.ts
    lifetime.ts
    decorators.ts
    metadata.ts
    graph.ts
    graph_format.ts
    validate.ts
    i18n.ts
    errors.ts
  express/
  hono/
  fresh/
  next/
  graphql/
examples/
  basic-ddd/
  explicit-deps/
  provider-patterns/
  dependency-graph/
  hono-api/
  express-api/
  graphql-request/
  express-graphql/
  fresh-routes/
  next-ddd/
```

This repository does not ship a CLI. Keep CLI-specific tooling out of `@wyrly/core`.

## 6. Core responsibilities

`packages/core` owns:

- `token<T>()`
- `createContainer()`
- `container.register()`
- `container.resolve()`
- `container.createScope()`
- `scope.resolve()`
- `scope.dispose()`
- `@Injectable()`
- Provider normalization
- Lifetime management
- Circular dependency detection
- Lifetime violation detection
- Inspect API
- Error types

## 7. What must not go in core

- HTTP request concepts
- Express types
- Hono types
- Fresh types
- Next.js types
- GraphQL types
- DataLoader implementations
- Database implementations
- Authentication implementations
- Filesystem scanning
- Heavy dependence on the TypeScript Compiler API

## 8. Adapter responsibilities

Keep adapters thin.

### Express adapter

- Create a scope per request
- Expose `req.di`
- Dispose the scope when the response finishes
- Register Express request/response tokens

### Hono adapter

- Create a scope per request
- Use `c.set("di", scope)`
- Dispose after the handler completes

### Fresh adapter

- Create a scope per request
- Expose `ctx.state.di`
- Provide `withDI` for route handlers
- Dispose after the handler completes
- Register Fresh context/request tokens

### GraphQL adapter

- Create a scope per GraphQL request
- Add `di` to context
- Make DataLoader registration in request scope straightforward

### Next.js adapter

- `withDI` for Route Handlers
- `withActionDI` for Server Actions
- Implement Server Component helpers carefully
- Do not store request scope globally

## 9. Lifetime design

Supported lifetimes:

```ts
type Lifetime = "singleton" | "scoped" | "transient";
```

Rules:

```txt
singleton -> scoped: error
singleton -> transient: allowed
scoped -> singleton: allowed
scoped -> transient: allowed
transient -> scoped: warning candidate
```

## 10. Error design

Define these errors:

- `ProviderNotFoundError`
- `CircularDependencyError`
- `InvalidProviderError`
- `ScopeDisposedError`
- `LifetimeViolationError`
- `DuplicateProviderError`

Messages should include:

- Token name
- Provider name
- Dependency path
- Lifetime
- Actionable hints

User-facing text goes through [`packages/core/i18n.ts`](packages/core/i18n.ts) `errorMessage()`. The error constructor `locale` is optional; when omitted, `resolveLocale()` picks from the runtime environment.

## 11. Inspect API

Expose the dependency graph:

```ts
const graph = container.inspect();
```

Shape:

```ts
type DependencyGraph = {
  nodes: Array<{
    id: string;
    name: string;
    lifetime: "singleton" | "scoped" | "transient";
    provider: "class" | "value" | "factory" | "existing";
  }>;
  edges: Array<{
    from: string;
    to: string;
  }>;
};
```

This API is the foundation for CI, external tooling, and agent integrations. Do not add HTML graph export or other presentation-heavy CLI features to core; keep those in separate tooling if needed.

## 12. TypeScript settings

Recommended:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "emitDecoratorMetadata": false
  }
}
```

## 13. Coding conventions

### 13.1 Prefer type safety

Avoid `any` when possible. Limited `any` is acceptable for constructor types and internal registries.

### 13.2 Keep the public API small

Minimize the core surface. Intended exports:

```ts
createContainer;
token;
Injectable;
Container;
Scope;
Provider;
Lifetime;
InjectionToken;
```

### 13.3 Hide internals

Do not export internal registries or metadata stores directly.

### 13.4 ESM first

Design for ESM:

```json
{
  "type": "module"
}
```

### 13.5 Tree shaking

Minimize side effects. Document that decorator metadata is stored at class evaluation time.

## 14. Testing

### 14.1 Unit tests

Required coverage:

- Token creation
- Class provider
- Value provider
- Factory provider
- Singleton
- Scoped
- Transient
- Circular dependency
- Duplicate provider
- Scope disposal
- Decorator metadata
- Lifetime violation

### 14.2 Type tests

Required:

- `token<T>()` inference
- `resolve(token)` return type
- Class token resolve
- Provider type constraints

Candidate tools:

- `jsr:@std/testing/types` (`assertType`, `IsExact`) — see `packages/core/types_test.ts`

### 14.3 Adapter tests

- Express middleware
- Hono middleware
- Fresh middleware / handler wrapper
- GraphQL context
- Next.js handler wrapper

## 15. Documentation

State clearly in the README:

```txt
No reflect-metadata.
No legacy decorators.
No parameter decorators.
No runtime type guessing.
Explicit dependencies.
Type-safe tokens.
Request scopes.
Lifetime validation.
```

### 15.1 Language and i18n

| Area | Rule |
|------|------|
| User-facing docs | **English** first: root [README.md](README.md) and [examples/](examples/) `README.md`. Japanese: sibling `README.ja.md` |
| Source comments / JSDoc | **English** |
| Core runtime messages | [`packages/core/i18n.ts`](packages/core/i18n.ts). `ValidationIssue.code` is a stable ID; display text is locale-dependent |
| Locale resolution | `resolveLocale()` — priority: `locale` argument > `WYRLY_LOCALE` > `LC_ALL` / `LC_MESSAGES` / `LANG` > Intl / `navigator.language` > `en` |
| Supported locales | `en` and `ja` only; other tags fall back to `en` |
| CI / tests | Assert on `code` primarily. Stabilize copy with `validate({ locale: "en" })` or `WYRLY_LOCALE=en` |
| New issues / errors | Add en/ja templates in `i18n.ts`; avoid hard-coded mixed-language strings |

### 15.2 Publishing

- Release docs: [PUBLISHING.md](PUBLISHING.md) (Japanese: [PUBLISHING.ja.md](PUBLISHING.ja.md))
- Before a release: `deno task ci`, `deno task publish:dry-run`, `deno task build:npm`, `deno task publish:npm:dry-run`, aligned `version` in all six `packages/*/deno.json`
- **GitHub Actions** (`.github/workflows/publish.yml`): JSR via **OIDC** (`id-token: write`); npm via **Trusted Publishing** (`publish:npm:ci` with `--provenance`). One-time setup: link each JSR package to the repo; register npm Trusted Publishers for five `@wyrly/*` packages — see PUBLISHING.md
- **Local JSR:** `deno task publish:jsr` (browser auth, no token by default)
- **Local npm:** [dnt](https://github.com/denoland/dnt) via `scripts/dnt/build.ts` → `packages/*/npm/` (five packages; `@wyrly/fresh` is JSR-only), then `deno task publish:npm` after `npm login` to `@wyrly`
- Adapter dnt configs live under `scripts/dnt/pkg.*.json` (omit `jsr:@wyrly/core` imports used only for JSR publish)
- Adapter `deno.json` must include `"@wyrly/core": "jsr:@wyrly/core@^1.0.0"` in `imports` for published graphs

## 16. Anti-patterns

### 16.1 Constructor type auto-inference

Forbidden:

```ts
const types = Reflect.getMetadata("design:paramtypes", target);
```

### 16.2 Global request scope

Forbidden:

```ts
let currentScope: Scope;
```

### 16.3 Injecting framework types into use cases

Discouraged:

```ts
class GetUserUseCase {
  constructor(private readonly req: Express.Request) {}
}
```

Preferred:

```ts
class GetUserUseCase {
  constructor(private readonly currentUser: CurrentUser) {}
}
```

## 17. Implementation priority (this repository)

1. `@wyrly/core`
2. Unit tests
3. Type tests
4. Express adapter
5. Hono adapter
6. Fresh adapter
7. GraphQL adapter
8. Next.js adapter
9. Inspect API / validate
10. Examples
11. User-facing README in this repository

## 18. When unsure

Decide in this order:

1. Fits the TypeScript 7 era
2. Aligns with standard decorators
3. Stays explicit and analyzable
4. Works well with DDD / Clean Architecture
5. Keeps core framework-agnostic
6. Keeps request scopes safe
7. Easy for AI agents to understand

## 19. North star

This project is not about adding more DI magic.

It is a toolkit to make dependencies explicit, validate them, visualize them, and keep TypeScript application design safe.
