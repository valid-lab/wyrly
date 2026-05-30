# @wyrly/yoga

GraphQL Yoga 5 向けのリクエストスコープ DI です。`yogaDIPlugin()` と `yogaContext()` で 1 GraphQL
リクエスト = 1 scope を作り、`onResponse` で dispose します。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/yoga @wyrly/graphql @wyrly/core graphql-yoga
```

Peer dependency: **graphql-yoga ^5.0.0**

## クイックスタート

```ts
import { createSchema, createYoga } from "graphql-yoga";
import { yogaContext, yogaDIPlugin, type YogaServerContext } from "@wyrly/yoga";
import { createContainer } from "@wyrly/core";

const container = createContainer();

const yoga = createYoga<YogaServerContext>({
  schema: createSchema({ typeDefs, resolvers }),
  plugins: [yogaDIPlugin(container)],
  context: yogaContext,
});
```

resolver では `ctx.wyrly.di.resolve(...)` を使います。

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=yoga_ja)
- [@wyrly/core](../core/README.ja.md)
- [guides/GRAPHQL_DISPOSE.ja.md](https://github.com/valid-lab/wyrly/blob/main/guides/GRAPHQL_DISPOSE.ja.md)
- [examples/yoga-graphql](https://github.com/valid-lab/wyrly/tree/main/examples/yoga-graphql)

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
| `@wyrly/yoga`    | あり     | 本パッケージ               |
| `@wyrly/apollo`  | あり     | Apollo Server プラグイン   |

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
