# @wyrly/yoga

Request-scoped dependency injection for GraphQL Yoga 5 without `reflect-metadata` — use
`yogaDIPlugin()` and `yogaContext()` for one scope per GraphQL request.

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/yoga @wyrly/graphql @wyrly/core graphql-yoga
```

Peer dependency: **graphql-yoga ^5.0.0**.

## Requirements

- Everything required by [`@wyrly/core`](../core/README.md) and
  [`@wyrly/graphql`](../graphql/README.md)
- **GraphQL Yoga 5.x**

## Quick start

```ts
import { createSchema, createYoga } from "graphql-yoga";
import { yogaContext, yogaDIPlugin, type YogaServerContext } from "@wyrly/yoga";
import { createContainer } from "@wyrly/core";

const container = createContainer();

const yoga = createYoga<YogaServerContext>({
  schema: createSchema({ typeDefs, resolvers }),
  plugins: [yogaDIPlugin(container, {
    configureScope(scope) {
      // map request → port tokens (e.g. CurrentUserToken)
    },
  })],
  context: yogaContext,
});
```

Resolvers use `ctx.wyrly.di.resolve(...)`. The plugin disposes the scope on `onResponse`.

## Documentation

- [Official docs](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=yoga_en)
- [@wyrly/graphql](../graphql/README.md)
- [guides/GRAPHQL_DISPOSE.md](https://github.com/valid-lab/wyrly/blob/main/guides/GRAPHQL_DISPOSE.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Yoga example](https://github.com/valid-lab/wyrly/tree/main/examples/yoga-graphql)

## Related packages

| Package          | npm  | Description           |
| ---------------- | ---- | --------------------- |
| `@wyrly/core`    | yes  | Core DI               |
| `@wyrly/graphql` | yes  | GraphQL context       |
| `@wyrly/yoga`    | yes  | This package          |
| `@wyrly/apollo`  | soon | Apollo Server adapter |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
