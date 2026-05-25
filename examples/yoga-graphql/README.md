# yoga-graphql

GraphQL Yoga 5 + [`@wyrly/yoga`](../../packages/yoga/) — one GraphQL request = one DI scope via
`yogaDIPlugin` and `yogaContext`.

Uses the same DDD layout and scoped `UserLoader` as [graphql-request](../graphql-request/).

Japanese: [README.ja.md](./README.ja.md)

## Request scope and disposal

| Rule                   | Implementation                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| One request, one scope | `yogaDIPlugin` `onRequest` (delegates to `@wyrly/graphql`)                                              |
| Loader is scoped       | `UserLoaderToken` with `lifetime: "scoped"` + `useFactory`                                              |
| Map HTTP to ports      | `configureScope` sets `CurrentUserToken` from `X-User-Id`                                               |
| Dispose after request  | `yogaDIPlugin` `onResponse` disposes the scope (see [GRAPHQL_DISPOSE](../../guides/GRAPHQL_DISPOSE.md)) |

Core code: [`presentation/server.ts`](./presentation/server.ts),
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts).

## What this example proves

- `@wyrly/yoga` integrates with GraphQL Yoga plugins and resolver `context`.
- Scoped DataLoader-style `UserLoader` is shared within a single GraphQL request.
- Use cases do not depend on `GraphQLRequestToken`; `CurrentUserToken` is set in the composition
  root boundary.

## Layout

| Layer          | Role                                   |
| -------------- | -------------------------------------- |
| domain         | Types and port interfaces              |
| application    | Batch user fetch use case              |
| infrastructure | Scoped `UserLoader` factory            |
| presentation   | Yoga server, `yogaDIPlugin`, resolvers |
| composition    | DI tokens and container wiring         |

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
