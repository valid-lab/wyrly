# @wyrly/hono

Request-scoped dependency injection for Hono, Cloudflare Workers, and modern TypeScript without
`reflect-metadata` — use `di()` middleware and `getDI(c)`.

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/hono @wyrly/core hono
```

Peer dependency: **hono ^4.0.0**.

Tested on **Node.js**, **Bun**, and **Cloudflare Workers** (see monorepo `compat/`).

## Requirements

- Everything required by [`@wyrly/core`](../core/README.md)
- **Hono 4.x**

## Quick start

```ts
import { Hono } from "hono";
import { di, getDI, type HonoDIVariables } from "@wyrly/hono";
import { createContainer } from "@wyrly/core";

const app = new Hono<{ Variables: HonoDIVariables }>();
app.use(di(createContainer()));

app.get("/users/:id", (c) => {
  const scope = getDI(c);
  return c.json({ disposed: scope.isDisposed() });
});
```

## Documentation

- [Official docs](https://docs.wyrly.dev/)
- [@wyrly/core](../core/README.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)
- [Hono DDD example](https://github.com/valid-lab/wyrly/tree/main/examples/hono-api)

## Related packages

| Package          | npm      | Description     |
| ---------------- | -------- | --------------- |
| `@wyrly/core`    | yes      | Core DI         |
| `@wyrly/hono`    | yes      | This package    |
| `@wyrly/express` | yes      | Express adapter |
| `@wyrly/graphql` | yes      | GraphQL adapter |
| `@wyrly/next`    | yes      | Next.js adapter |
| `@wyrly/fresh`   | JSR only | Fresh 2.x       |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
