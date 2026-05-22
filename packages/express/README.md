# @wyrly/express

Wyrly DI adapter for Express — one request scope per HTTP request via `diMiddleware`.

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/express @wyrly/core express
```

Peer dependency: **express ^5.0.0**.

## Requirements

- Everything required by [`@wyrly/core`](../core/README.md)
- **Express 5.x**

## Quick start

```ts
import express from "express";
import { asExpressRequestWithDI, diMiddleware } from "@wyrly/express";
import { createContainer } from "@wyrly/core";

const app = express();
const container = createContainer();
app.use(diMiddleware(container));

app.get("/users/:id", (req, res) => {
  const di = asExpressRequestWithDI(req).di;
  res.json({ ok: true });
});
```

## Documentation

- [@wyrly/core](../core/README.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)

## Related packages

| Package | npm | Description |
| ------- | --- | ----------- |
| `@wyrly/core` | yes | Core DI |
| `@wyrly/express` | yes | This package |
| `@wyrly/hono` | yes | Hono adapter |
| `@wyrly/graphql` | yes | GraphQL adapter |
| `@wyrly/next` | yes | Next.js adapter |
| `@wyrly/fresh` | JSR only | Fresh 2.x |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
