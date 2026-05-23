# Migrating from InversifyJS

This guide helps you evaluate and migrate from InversifyJS to Wyrly DI when you want a smaller,
explicit TypeScript DI layer without `reflect-metadata`, parameter decorators, or container magic.

Japanese: [MIGRATING_FROM_INVERSIFY.ja.md](./MIGRATING_FROM_INVERSIFY.ja.md)

## Main model shift

InversifyJS is powerful and mature, but many projects use it with decorator metadata and runtime
reflection. Wyrly DI keeps wiring explicit:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

Wyrly DI favors a composition root, typed tokens, and inspectable dependency graphs over implicit
metadata-based discovery.

## Concept mapping

| InversifyJS concept                    | Wyrly DI equivalent                                        |
| -------------------------------------- | ---------------------------------------------------------- |
| `Container`                            | `createContainer()`                                        |
| `TYPES.UserRepository` symbols         | `token<UserRepository>("UserRepository")`                  |
| `@injectable()`                        | `@Injectable({ deps, lifetime })`                          |
| `@inject(TYPES.X)` parameter decorator | Explicit `deps: [XToken]`                                  |
| `bind().to()`                          | `container.register(token, { useClass })`                  |
| `bind().toConstantValue()`             | `container.register(token, { useValue })`                  |
| `bind().toDynamicValue()`              | `container.register(token, { useFactory })`                |
| Request scope                          | `lifetime: "scoped"` plus `createScope()` or a web adapter |

## Migration steps

1. Pick one bounded context or route group.
2. Define Wyrly typed tokens for each interface/port.
3. Move `@inject(...)` parameter decorators into `@Injectable({ deps })` or registration-time
   `deps`.
4. Replace bindings with explicit `container.register(...)` calls in a composition root.
5. Use a framework adapter to create and dispose one scope per request.
6. Add `container.inspect()` or `container.validate()` where graph visibility helps code review or
   CI.

## Before and after

Before:

```ts
const TYPES = {
  UserRepository: Symbol.for("UserRepository"),
};

@injectable()
class GetUserUseCase {
  constructor(@inject(TYPES.UserRepository) private readonly users: UserRepository) {}
}

container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container.bind(GetUserUseCase).toSelf();
```

After:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}

container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
  lifetime: "scoped",
});
container.register(GetUserUseCase);
```

## What changes operationally

- Dependencies are listed where reviewers and static tools can see them.
- Standard decorators are enough; legacy metadata is not required.
- Request scope is explicit and can be aligned with HTTP or GraphQL request lifetimes.
- The graph can be exported and validated through Wyrly core APIs.

## Good first migration target

Migrate one request path that already has a clear use case and repository boundary. This validates
typed tokens, lifetimes, and adapter scope disposal without requiring a full container rewrite.
