# fresh-routes

Compare `@wyrly/fresh` `di()` middleware (`App`) vs `withDI()` handler (direct invoke). This is a
stricter DDD example: DI tokens live under `composition/`, while the domain uses a `UserId` value
object instead of raw strings.

## What this example proves

- Fresh middleware and route handlers can share the same application and domain boundaries.
- Request headers and route params are mapped to scoped values and domain value objects at the
  presentation boundary.

Japanese: [README.ja.md](./README.ja.md)

## Run

```sh
deno task example:fresh-routes
```

## See also

- Hono: [hono-api](../hono-api/)
