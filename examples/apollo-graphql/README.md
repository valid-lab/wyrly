# apollo-graphql

Apollo Server 4 + `@wyrly/graphql` — request context and `willSendResponse` disposal.

Uses the same DDD layout and scoped `UserLoader` as [graphql-request](../graphql-request/). Planned
v2.2.0: [`@wyrly/apollo`](../../packages/apollo/) will wrap this lifecycle.

Japanese: [README.ja.md](./README.ja.md)

## Request scope and disposal

| Rule                   | Implementation                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| One request, one scope | `createRequestContext` builds `GraphQLDIContext` per operation      |
| Loader is scoped       | `UserLoaderToken` with `lifetime: "scoped"` + `useFactory`          |
| Map HTTP to ports      | `configureScope` sets `CurrentUserToken` from `X-User-Id`           |
| Dispose after request  | `wyrlyDisposePlugin` `willSendResponse` calls `ctx.wyrly.dispose()` |

Core code: [`presentation/server.ts`](./presentation/server.ts),
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts). See
[guides/GRAPHQL_DISPOSE.md](../../guides/GRAPHQL_DISPOSE.md).

## What this example proves

- `createGraphQLDIContext` pairs with `executeOperation` and an Apollo dispose plugin.
- Scoped `UserLoader` stays request-local.
- `CurrentUserToken` is set in `configureScope`, not via `GraphQLRequestToken` in use cases.

## Layout

| Layer          | Role                                     |
| -------------- | ---------------------------------------- |
| domain         | Types and port interfaces                |
| application    | Batch user fetch use case                |
| infrastructure | Scoped `UserLoader` factory              |
| presentation   | Apollo server, dispose plugin, resolvers |
| composition    | DI tokens and container wiring           |

## Run

```sh
deno task example:apollo-graphql
```

Runs `server.executeOperation()` in-process (no listening HTTP port).

## See also

- [guides/GRAPHQL_DISPOSE.md](../../guides/GRAPHQL_DISPOSE.md)
- [graphql-request](../graphql-request/) — scoped DataLoader without a GraphQL server
- [yoga-graphql](../yoga-graphql/) — GraphQL Yoga 5 + Envelop plugin
