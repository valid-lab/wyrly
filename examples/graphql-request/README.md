# graphql-request

`createGraphQLDIContext` and a scoped **DataLoader-style** batch loader (no GraphQL server).

This is the reference example for **v0.3 DataLoader integration**: one GraphQL request = one DI
scope = one loader instance.

Japanese: [README.ja.md](./README.ja.md)

## DataLoader pattern

| Rule                    | Implementation                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------ |
| One request, one scope  | `createGraphQLDIContext(appContainer)` in presentation                               |
| Loader is scoped        | `UserLoaderToken` registered with `lifetime: "scoped"` + `useFactory`                |
| Batch inside the loader | `GetUsersByIdsUseCase` loads many IDs; per-id `load()` dedupes via an in-scope `Map` |
| Dispose after request   | `ctx.dispose()` when the pseudo-request ends                                         |

Core code: [`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts).

```ts
container.register(UserLoaderToken, {
  lifetime: "scoped",
  deps: [GetUsersByIdsUseCase],
  useFactory: (_scope, getUsersByIds) => {
    const cache = new Map<string, Promise<User | null>>();
    const useCase = getUsersByIds as GetUsersByIdsUseCase;
    return {
      load(id: string) {
        /* batch + cache per request */
      },
    };
  },
});
```

In a real app, register the same factory from your composition root and resolve `UserLoader` from
`ctx.di` in resolvers. See
[`@wyrly/graphql` `createGraphQLDIContext`](../../packages/graphql/context.ts).

## What this example proves

- A GraphQL request can own exactly one DI scope and one scoped loader instance.
- DataLoader-style request caches can be modeled as normal scoped dependencies.
- Resolver code can depend on `ctx.di` without hiding dependency ownership in globals.

## Layout

| Layer          | Role                               |
| -------------- | ---------------------------------- |
| domain         | Types and port interfaces          |
| application    | Batch user fetch use case          |
| infrastructure | Scoped `UserLoader` factory        |
| presentation   | Pseudo-resolvers + `ctx.dispose()` |
| composition    | DI tokens and container wiring     |

## Run

```sh
deno task example:graphql-request
```

## See also

- Combined: [express-graphql](../express-graphql/)
- Core: [provider-patterns](../provider-patterns/)
