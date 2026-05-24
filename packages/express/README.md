# @wyrly/express

Request-scoped dependency injection for Express and modern TypeScript without `reflect-metadata` —
one scope per HTTP request via `diMiddleware`.

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

Use `onDisposeError` when scoped resources need observable asynchronous cleanup:

```ts
app.use(diMiddleware(container, {
  onDisposeError(error, req) {
    console.error("Failed to dispose request scope", req.path, error);
  },
}));
```

## Documentation

- [Official docs](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=express_en)
- [@wyrly/core](../core/README.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)
- [Express DDD example](https://github.com/valid-lab/wyrly/tree/main/examples/express-api)

## Related packages

| Package          | npm      | Description     |
| ---------------- | -------- | --------------- |
| `@wyrly/core`    | yes      | Core DI         |
| `@wyrly/express` | yes      | This package    |
| `@wyrly/hono`    | yes      | Hono adapter    |
| `@wyrly/graphql` | yes      | GraphQL adapter |
| `@wyrly/next`    | yes      | Next.js adapter |
| `@wyrly/fresh`   | JSR only | Fresh 2.x       |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
