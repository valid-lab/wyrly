# hono-api

`@wyrly/hono` request-scoped DI with a DDD layout.

Japanese: [README.ja.md](./README.ja.md)

## Layout

| Layer | Role |
| ----- | ---- |
| domain | Entities and port tokens |
| application | `GetUserUseCase` |
| infrastructure | In-memory repository |
| presentation | `di()` + `X-User-Id` → `CurrentUserToken` |

## Run

```sh
deno task example:hono-api
```

Uses `app.request()` (no network). Optional real server: run `main.ts` with `Deno.serve` in your own script.

## See also

- Core: [basic-ddd](../basic-ddd/)
- GraphQL: [graphql-request](../graphql-request/)
