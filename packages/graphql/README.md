# @wyrly/graphql

Request-scoped dependency injection for GraphQL and DataLoader-style resolver patterns without
`reflect-metadata` — one scope per request via `createGraphQLDIContext`.

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/graphql @wyrly/core
```

Works with any GraphQL server that can pass `Request` / `Response` (or configure scope manually).

## Requirements

- Everything required by [`@wyrly/core`](../core/README.md)

## Quick start

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";
import { createContainer } from "@wyrly/core";

const container = createContainer();

const context = async ({ req, res }: { req: Request; res: Response }) =>
  createGraphQLDIContext(container, { request: req, response: res });

// resolvers use ctx.di.resolve(...)
```

## Documentation

- [@wyrly/core](../core/README.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)
- [GraphQL DataLoader example](https://github.com/valid-lab/wyrly/tree/main/examples/graphql-request)

## Related packages

| Package          | npm      | Description     |
| ---------------- | -------- | --------------- |
| `@wyrly/core`    | yes      | Core DI         |
| `@wyrly/graphql` | yes      | This package    |
| `@wyrly/express` | yes      | Express adapter |
| `@wyrly/hono`    | yes      | Hono adapter    |
| `@wyrly/next`    | yes      | Next.js adapter |
| `@wyrly/fresh`   | JSR only | Fresh 2.x       |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
