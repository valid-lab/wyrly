# fastify-api

Lightweight REST example with `@wyrly/fastify` `diPlugin` and request scope. Same DDD layout as
[express-api](../express-api/): tokens in `composition/`, `UserId` value object in the domain.

Japanese: [README.ja.md](./README.ja.md)

## What this example proves

- `diPlugin` maps one HTTP request to one DI scope (disposed on response `finish` / `close`).
- `preHandler` sets `CurrentUserToken` from `X-User-Id` without leaking Fastify types into use
  cases.
- Route params become `UserId` at the presentation boundary.

## Run

```sh
deno task example:fastify-api
```

Requires `net` (`127.0.0.1` listen + fetch).

## See also

- [express-api](../express-api/)
- [hono-api](../hono-api/)
- GraphQL: [yoga-graphql](../yoga-graphql/) (`@wyrly/yoga`),
  [apollo-express-graphql](../apollo-express-graphql/) (`@wyrly/apollo` on Express; same adapters on
  Fastify)
