# @wyrly/apollo

Request-scoped dependency injection for Apollo Server 4+ without `reflect-metadata` — use
`apolloDIPlugin()` for one scope per GraphQL operation and automatic disposal in `willSendResponse`.

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/apollo @wyrly/graphql @wyrly/core @apollo/server graphql
```

Peer dependencies: **@apollo/server ^4.0.0**, **graphql ^16.0.0**.

## Requirements

- Everything required by [`@wyrly/core`](../core/README.md) and
  [`@wyrly/graphql`](../graphql/README.md)
- **Apollo Server 4.x** (Node)

## Quick start

```ts
import { ApolloServer } from "@apollo/server";
import { apolloDIPlugin, type ApolloServerContext } from "@wyrly/apollo";
import { createContainer } from "@wyrly/core";

const container = createContainer();

const server = new ApolloServer<ApolloServerContext>({
  typeDefs,
  resolvers,
  plugins: [apolloDIPlugin(container, {
    configureScope(scope) {
      // map request → port tokens (e.g. CurrentUserToken)
    },
  })],
});
```

Resolvers use `ctx.wyrly.di.resolve(...)`. The plugin disposes the scope in `willSendResponse`.

With Express, pass `req` / `res` via Apollo's `context` and the plugin registers
`ApolloRequestToken` / `ApolloResponseToken` — still map to port tokens in `configureScope`, not in
domain code.

## Documentation

- [Official docs](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=apollo_en)
- [@wyrly/graphql](../graphql/README.md)
- [guides/GRAPHQL_DISPOSE.md](https://github.com/valid-lab/wyrly/blob/main/guides/GRAPHQL_DISPOSE.md)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Apollo example](https://github.com/valid-lab/wyrly/tree/main/examples/apollo-graphql)

## Related packages

| Package          | npm      | Description           |
| ---------------- | -------- | --------------------- |
| `@wyrly/core`    | yes      | Core DI               |
| `@wyrly/next`    | yes      | Next.js App Router    |
| `@wyrly/express` | yes      | Express 5 middleware  |
| `@wyrly/hono`    | yes      | Hono middleware       |
| `@wyrly/fastify` | yes      | Fastify 5 plugin      |
| `@wyrly/fresh`   | JSR only | Fresh 2.x             |
| `@wyrly/graphql` | yes      | GraphQL request scope |
| `@wyrly/yoga`    | yes      | GraphQL Yoga 5 plugin |
| `@wyrly/apollo`  | yes      | This package          |

## License

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
