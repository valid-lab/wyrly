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

## 関連

- [guides/GRAPHQL_DISPOSE.ja.md](https://github.com/valid-lab/wyrly/blob/main/guides/GRAPHQL_DISPOSE.ja.md)
- [examples/yoga-graphql](https://github.com/valid-lab/wyrly/tree/main/examples/yoga-graphql)

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
