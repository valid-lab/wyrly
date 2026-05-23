# Migrating from tsyringe

This guide helps you evaluate and migrate from `tsyringe` to Wyrly DI when your main goal is to
avoid `reflect-metadata`, legacy decorator metadata, and implicit constructor type discovery.

Japanese: [MIGRATING_FROM_TSYRINGE.ja.md](./MIGRATING_FROM_TSYRINGE.ja.md)

## Main model shift

`tsyringe` commonly discovers constructor dependencies from emitted metadata. Wyrly DI makes
dependencies explicit:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

That extra `deps` list is intentional. It keeps dependency wiring visible to TypeScript, CI, code
review, and tools that inspect the graph.

## Concept mapping

| tsyringe concept                     | Wyrly DI equivalent                             |
| ------------------------------------ | ----------------------------------------------- |
| `@injectable()`                      | `@Injectable({ deps, lifetime })`               |
| `@inject(token)` parameter decorator | Typed `token<T>()` plus explicit `deps`         |
| Container registration               | `container.register(tokenOrClass, provider)`    |
| Child container / request container  | `container.createScope()` or a web adapter      |
| Singleton / transient lifecycle      | `lifetime: "singleton"` / `"transient"`         |
| Scoped per request                   | `lifetime: "scoped"` plus adapter-created scope |

## Migration steps

1. Identify one composition root where dependencies are registered.
2. Replace interface/string tokens with typed Wyrly tokens.
3. Move constructor parameter decorators into `@Injectable({ deps })` or registration-time `deps`.
4. Register request-bound dependencies with `lifetime: "scoped"`.
5. Wrap the web entry point with the matching adapter:
   - `@wyrly/next` for App Router
   - `@wyrly/hono` for Hono / Cloudflare Workers
   - `@wyrly/express` for Express
   - `@wyrly/graphql` for GraphQL context
6. Add `container.validate()` in tests or CI once multiple lifetimes are present.

## Before and after

Before:

```ts
@injectable()
class GetUserUseCase {
  constructor(@inject("UserRepository") private readonly users: UserRepository) {}
}
```

After:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

## What changes operationally

- You no longer need `reflect-metadata`.
- You no longer need `emitDecoratorMetadata`.
- You do not use parameter decorators.
- You can inspect and validate the graph through the container API.
- Request scope is explicit and adapter-owned, which makes disposal easier to reason about.

## Good first migration target

Start with one feature slice: a repository token, one use case, and one HTTP/GraphQL entry point.
Avoid migrating every service at once; the goal is to validate the new composition root and request
scope model first.
