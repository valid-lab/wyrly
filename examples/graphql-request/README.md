# graphql-request

`createGraphQLDIContext` and a scoped **DataLoader-style** batch loader (no GraphQL server).

Japanese: [README.ja.md](./README.ja.md)

This is the reference example for **v0.3 DataLoader integration**: one GraphQL request = one DI
scope = one loader instance.

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
  useFactory: (scope) => {
    const cache = new Map<string, Promise<User | null>>();
    const useCase = scope.resolve(GetUsersByIdsUseCase);
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

## Layout

| Layer          | Role                               |
| -------------- | ---------------------------------- |
| domain         | Types and port tokens              |
| application    | Batch user fetch use case          |
| infrastructure | Scoped `UserLoader` factory        |
| presentation   | Pseudo-resolvers + `ctx.dispose()` |

## Run

```sh
deno task example:graphql-request
```

## See also

- Combined: [express-graphql](../express-graphql/)
- Core: [provider-patterns](../provider-patterns/)
