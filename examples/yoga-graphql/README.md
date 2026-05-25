# yoga-graphql

GraphQL Yoga 5 + `@wyrly/graphql` — one GraphQL request = one DI scope, disposed via an Envelop
plugin.

Uses the same DDD layout and scoped `UserLoader` as [graphql-request](../graphql-request/). Planned
v2.2.0: [`@wyrly/yoga`](../../packages/yoga/) will wrap this lifecycle.

Japanese: [README.ja.md](./README.ja.md)

## Request scope and disposal

| Rule                   | Implementation                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| One request, one scope | `createGraphQLDIContext` in `wyrlyDIPlugin` `onRequest`                                           |
| Loader is scoped       | `UserLoaderToken` with `lifetime: "scoped"` + `useFactory`                                        |
| Map HTTP to ports      | `configureScope` sets `CurrentUserToken` from `X-User-Id`                                         |
| Dispose after request  | `onResponse` calls `ctx.wyrly.dispose()` (see [GRAPHQL_DISPOSE](../../guides/GRAPHQL_DISPOSE.md)) |

Core code: [`presentation/server.ts`](./presentation/server.ts),
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts).

## What this example proves

- `createGraphQLDIContext` works with GraphQL Yoga plugins and resolver `context`.
- Scoped DataLoader-style `UserLoader` is shared within a single GraphQL request.
- Use cases do not depend on `GraphQLRequestToken`; `CurrentUserToken` is set in the composition
  root boundary.

## Layout

| Layer          | Role                                    |
| -------------- | --------------------------------------- |
| domain         | Types and port interfaces               |
| application    | Batch user fetch use case               |
| infrastructure | Scoped `UserLoader` factory             |
| presentation   | Yoga server, `wyrlyDIPlugin`, resolvers |
| composition    | DI tokens and container wiring          |

## Run

```sh
deno task example:yoga-graphql
```

Runs `yoga.fetch()` in-process (no listening TCP port). Optional: wrap `createYogaServer` with
`Deno.serve` in your own script for a real HTTP server.

## See also

- [guides/GRAPHQL_DISPOSE.md](../../guides/GRAPHQL_DISPOSE.md)
- [graphql-request](../graphql-request/) — scoped DataLoader without a GraphQL server
- [apollo-graphql](../apollo-graphql/) — Apollo Server 4 + `willSendResponse`
