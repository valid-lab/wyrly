# hono-api

`@wyrly/hono` request-scoped DI with a DDD layout.

Japanese: [README.ja.md](./README.ja.md)

## Layout

| Layer          | Role                                      |
| -------------- | ----------------------------------------- |
| domain         | Entities and port interfaces              |
| application    | `GetUserUseCase`                          |
| infrastructure | In-memory repository                      |
| presentation   | `di()` + `X-User-Id` → `CurrentUserToken` |
| composition    | DI tokens and container registration      |

## What this example proves

- `@wyrly/hono` can create one DI scope per request in a Hono app.
- Request data such as `X-User-Id` can be exposed as scoped dependencies.
- The same DDD composition root can run in Node.js, Bun, or Cloudflare Workers-oriented Hono
  deployments.

## Run

```sh
deno task example:hono-api
```

Uses `app.request()` (no network). Optional real server: run `main.ts` with `Deno.serve` in your own
script.

## See also

- Core: [basic-ddd](../basic-ddd/)
- GraphQL: [graphql-request](../graphql-request/)
