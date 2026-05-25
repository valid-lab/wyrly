# apollo-express-graphql

Express 5 + Apollo Server 4 + [`@wyrly/express`](../../packages/express/) +
[`@wyrly/apollo`](../../packages/apollo/) — HTTP middleware and GraphQL plugin each own a request
scope on the same app.

Japanese: [README.ja.md](./README.ja.md)

## Request scopes

| Path            | Scope                     | Wiring                                                                   |
| --------------- | ------------------------- | ------------------------------------------------------------------------ |
| `GET /health`   | Express (`diMiddleware`)  | `mapCurrentUser` sets `CurrentUserToken` on `req.di`                     |
| `POST /graphql` | Apollo (`apolloDIPlugin`) | `configureScope` maps `X-User-Id` → `CurrentUserToken` on `ctx.wyrly.di` |

GraphQL resolvers use **`ctx.wyrly.di`**, not Express `req.di`. See
[guides/GRAPHQL_DISPOSE.md](../../guides/GRAPHQL_DISPOSE.md).

## What this example proves

- `@wyrly/express` and `@wyrly/apollo` can coexist on one Express app.
- Apollo `context: ({ req, res }) => ({ req, res })` lets the plugin register Node HTTP tokens.
- Scoped `UserLoader` is disposed when the GraphQL response ends.

## Run

```sh
deno task example:apollo-express-graphql
```

Starts a local server, calls `/health` and `/graphql`, then exits.

## See also

- [apollo-graphql](../apollo-graphql/) — in-process `executeOperation`
- [express-api](../express-api/) — REST-only Express DI
