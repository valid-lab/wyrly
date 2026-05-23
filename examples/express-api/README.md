# express-api

Lightweight REST example with `@wyrly/express` `diMiddleware` and request scope. This is a stricter
DDD example: DI tokens live under `composition/`, while the domain uses a `UserId` value object
instead of raw strings.

## What this example proves

- Express middleware can map request data to scoped application values before handlers run.
- Route params are converted to domain value objects at the presentation boundary.
- `diMiddleware` can host DDD use cases without leaking Express types into the domain.

Japanese: [README.ja.md](./README.ja.md)

## Run

```sh
deno task example:express-api
```

Requires `net` (`127.0.0.1` listen + fetch).

## See also

- Combined: [express-graphql](../express-graphql/)
- Hono: [hono-api](../hono-api/)
