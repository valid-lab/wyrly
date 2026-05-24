# @wyrly/next

Request-scoped dependency injection for Next.js 15+ App Router without `reflect-metadata` — route
handlers (`withDI`), Server Actions (`withActionDI`), and Server Components (`createServerDI`).

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/next @wyrly/core next react
```

Peer dependencies: **next ^15.0.0**, **react ^19.0.0**.

## Requirements

- Everything required by [`@wyrly/core`](../core/README.md)
- **Next.js 15+** (App Router)

## Quick start (Route Handler)

```ts
import { withDI } from "@wyrly/next";
import { createContainer } from "@wyrly/core";

const container = createContainer();

export const GET = withDI(container, async (_req, { di }) => {
  const usecase = di.resolve(MyUseCase);
  return Response.json(await usecase.run());
});
```

For Server Components, use `createServerDI` — see
[API.md](https://github.com/valid-lab/wyrly/blob/main/API.md).

## Documentation

- [Official docs](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=next_en)
- [@wyrly/core](../core/README.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)
- [Next.js DDD example](https://github.com/valid-lab/wyrly/tree/main/examples/next-ddd)

## Related packages

| Package          | npm      | Description     |
| ---------------- | -------- | --------------- |
| `@wyrly/core`    | yes      | Core DI         |
| `@wyrly/next`    | yes      | This package    |
| `@wyrly/express` | yes      | Express adapter |
| `@wyrly/hono`    | yes      | Hono adapter    |
| `@wyrly/graphql` | yes      | GraphQL adapter |
| `@wyrly/fresh`   | JSR only | Fresh 2.x       |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
