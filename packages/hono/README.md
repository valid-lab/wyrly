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

- [Official docs](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=hono_en)
- [@wyrly/core](../core/README.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)
- [Hono DDD example](https://github.com/valid-lab/wyrly/tree/main/examples/hono-api)

## Related packages

| Package          | npm      | Description           |
| ---------------- | -------- | --------------------- |
| `@wyrly/core`    | yes      | Core DI               |
| `@wyrly/next`    | yes      | Next.js App Router    |
| `@wyrly/express` | yes      | Express 5 middleware  |
| `@wyrly/hono`    | yes      | This package          |
| `@wyrly/fastify` | yes      | Fastify 5 plugin      |
| `@wyrly/fresh`   | JSR only | Fresh 2.x             |
| `@wyrly/graphql` | yes      | GraphQL request scope |
| `@wyrly/yoga`    | yes      | GraphQL Yoga 5 plugin |
| `@wyrly/apollo`  | yes      | Apollo Server plugin  |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
