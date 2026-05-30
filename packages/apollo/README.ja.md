# @wyrly/apollo

Apollo Server 4+ 向けのリクエストスコープ DI です。`apolloDIPlugin()` で 1 GraphQL 操作 = 1 scope
を作り、 `willSendResponse` で dispose します。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/apollo @wyrly/graphql @wyrly/core @apollo/server graphql
```

Peer dependencies: **@apollo/server ^4.0.0**, **graphql ^16.0.0**

## クイックスタート

```ts
import { ApolloServer } from "@apollo/server";
import { apolloDIPlugin, type ApolloServerContext } from "@wyrly/apollo";
import { createContainer } from "@wyrly/core";

const container = createContainer();

const server = new ApolloServer<ApolloServerContext>({
  typeDefs,
  resolvers,
  plugins: [apolloDIPlugin(container)],
});
```

resolver では `ctx.wyrly.di.resolve(...)` を使います。

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=apollo_ja)
- [@wyrly/core](../core/README.ja.md)
- [guides/GRAPHQL_DISPOSE.ja.md](https://github.com/valid-lab/wyrly/blob/main/guides/GRAPHQL_DISPOSE.ja.md)
- [examples/apollo-graphql](https://github.com/valid-lab/wyrly/tree/main/examples/apollo-graphql)

## 関連パッケージ

| パッケージ       | npm      | 説明                       |
| ---------------- | -------- | -------------------------- |
| `@wyrly/core`    | あり     | コア DI                    |
| `@wyrly/next`    | あり     | Next.js App Router         |
| `@wyrly/express` | あり     | Express 5 ミドルウェア     |
| `@wyrly/hono`    | あり     | Hono ミドルウェア          |
| `@wyrly/fastify` | あり     | Fastify 5 プラグイン       |
| `@wyrly/fresh`   | JSR のみ | Fresh 2.x                  |
| `@wyrly/graphql` | あり     | GraphQL リクエストスコープ |
| `@wyrly/yoga`    | あり     | GraphQL Yoga 5 プラグイン  |
| `@wyrly/apollo`  | あり     | 本パッケージ               |

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
