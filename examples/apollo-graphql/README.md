# apollo-graphql

Apollo Server 4 + [`@wyrly/apollo`](../../packages/apollo/) — `apolloDIPlugin` for one GraphQL
operation = one DI scope, disposed in `willSendResponse`.

Uses the same DDD layout and scoped `UserLoader` as [graphql-request](../graphql-request/).

Japanese: [README.ja.md](./README.ja.md)

## Request scope and disposal

| Rule                   | Implementation                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| One request, one scope | `apolloDIPlugin` in `requestDidStart` (delegates to `@wyrly/graphql`)                          |
| Loader is scoped       | `UserLoaderToken` with `lifetime: "scoped"` + `useFactory`                                     |
| Map HTTP to ports      | `configureScope` sets `CurrentUserToken` from `X-User-Id` on the Fetch request                 |
| Dispose after request  | `willSendResponse` disposes the scope (see [GRAPHQL_DISPOSE](../../guides/GRAPHQL_DISPOSE.md)) |

Core code: [`presentation/server.ts`](./presentation/server.ts),
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts).

## What this example proves

- `@wyrly/apollo` works with `executeOperation` and resolver `context.wyrly`.
- Scoped `UserLoader` stays request-local.
- `CurrentUserToken` is set in `configureScope`, not via transport tokens in use cases.

## Layout

| Layer          | Role                                       |
| -------------- | ------------------------------------------ |
| domain         | Types and port interfaces                  |
| application    | Batch user fetch use case                  |
| infrastructure | Scoped `UserLoader` factory                |
| presentation   | Apollo server, `apolloDIPlugin`, resolvers |
| composition    | DI tokens and container wiring             |

## Run

```sh
deno task example:apollo-graphql
```

Runs `server.executeOperation()` in-process (no listening HTTP port).

## See also

- [guides/GRAPHQL_DISPOSE.md](../../guides/GRAPHQL_DISPOSE.md)
- [apollo-express-graphql](../apollo-express-graphql/) — Express + Apollo on `/graphql`
- [yoga-graphql](../yoga-graphql/) — GraphQL Yoga 5
