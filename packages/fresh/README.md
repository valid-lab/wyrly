# @wyrly/fresh

Request-scoped dependency injection for Fresh 2.x and Deno without `reflect-metadata` — `di()`
middleware and `withDI` route handlers.

Japanese: [README.ja.md](./README.ja.md)

## Install (JSR only)

**Not published to npm** — Fresh 2.x depends on `jsr:@fresh/core`, which has no npm package.

```jsonc
// deno.json
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^1.0.0",
    "@wyrly/fresh": "jsr:@wyrly/fresh@^1.0.0"
  }
}
```

## Requirements

- **Deno 2.x** / Fresh 2.x
- Everything required by [`@wyrly/core`](../core/README.md) on JSR

## Quick start

```ts
import { createContainer } from "@wyrly/core";
import { di, withDI } from "@wyrly/fresh";

const container = createContainer();

// middleware in routes/_middleware.ts or app.use(di(container))
// route: export const handler = withDI(container, async (req, ctx) => { ... });
```

See [examples/fresh-routes](https://github.com/valid-lab/wyrly/tree/main/examples/fresh-routes) in
the monorepo.

## Documentation

- [@wyrly/core](../core/README.md) (JSR)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Publishing](https://github.com/valid-lab/wyrly/blob/main/PUBLISHING.md)
- [Fresh routes example](https://github.com/valid-lab/wyrly/tree/main/examples/fresh-routes)

## Related packages

| Package          | npm      | Description     |
| ---------------- | -------- | --------------- |
| `@wyrly/core`    | yes      | Core DI         |
| `@wyrly/fresh`   | JSR only | This package    |
| `@wyrly/express` | yes      | Express adapter |
| `@wyrly/hono`    | yes      | Hono adapter    |
| `@wyrly/graphql` | yes      | GraphQL adapter |
| `@wyrly/next`    | yes      | Next.js adapter |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
