# GraphQL の request scope と dispose

English: [GRAPHQL_DISPOSE.md](./GRAPHQL_DISPOSE.md)

`@wyrly/graphql` を GraphQL サーバーと組み合わせ、**1 GraphQL リクエスト = 1 DI scope** を守り、
リクエスト終了時に **必ず dispose する** ためのガイドです。


## 原則

```txt
1 GraphQL request = 1 DI scope = 1 dispose()
```

DataLoader、リクエストコンテキスト、リクエスト単位の Repository など scoped provider は
リクエストをまたいで共有してはいけません。`dispose()` を忘れると disposer と scoped キャッシュが
GC まで残ります。


## 手動パターン（`createGraphQLDIContext`）

リクエストごとに `context` を組み立てられるサーバーなら、どれでも使えます。

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";

const ctx = await createGraphQLDIContext(container, {
  request,
  response,
  configureScope(scope) {
    scope.set(CurrentUserToken, { id: userIdFrom(request) });
  },
});

try {
  const usecase = ctx.di.resolve(GetUserUseCase);
  return await usecase.execute(args.id);
} finally {
  await ctx.dispose();
}
```

参照: [`packages/graphql/context.ts`](../packages/graphql/context.ts)、
[`examples/graphql-request`](../examples/graphql-request/)。


## GraphQL Yoga（手動 plugin）

`@wyrly/yoga`（v2.2.0 予定）までは、Yoga / Envelop plugin で dispose します。

```ts
const wyrlyPlugin = {
  async onRequest({ request }) {
    const ctx = await createGraphQLDIContext(container, { request });
    requestToCtx.set(request, ctx);
  },
  async onResponse({ request }) {
    const ctx = requestToCtx.get(request);
    if (ctx) await ctx.dispose();
  },
};
```

実行例: [`examples/yoga-graphql`](../examples/yoga-graphql/)。


## Apollo Server 4+（手動 plugin）

`@wyrly/apollo`（v2.2.0 予定）までは `requestDidStart` → `willSendResponse` で dispose します。

```ts
const wyrlyPlugin = {
  async requestDidStart() {
    const ctx = await createGraphQLDIContext(container, { request, response });
    return {
      async willSendResponse() {
        await ctx.dispose();
      },
    };
  },
};
```

実行例: [`examples/apollo-graphql`](../examples/apollo-graphql/)。


## composition root: HTTP → port token

UseCase に `GraphQLRequestToken` を注入しないでください。`configureScope` で変換します。

```ts
configureScope(scope) {
  const userId = request.headers.get("x-user-id") ?? "anonymous";
  scope.set(CurrentUserToken, { id: UserId.from(userId) });
}
```

Express の [`examples/express-api`](../examples/express-api/) と同型です。


## DataLoader 風 loader

loader は **scoped** factory で登録し、resolver では `ctx.di` から resolve します。

[`examples/graphql-request/infrastructure/user_loader.ts`](../examples/graphql-request/infrastructure/user_loader.ts)
を参照してください。


## アンチパターン

| アンチパターン | 問題 |
| -------------- | ---- |
| グローバルな `currentScope` | 並行リクエストで破綻 |
| `dispose()` しない | scoped のリーク |
| domain に `GraphQLRequestToken` | ドメインが GraphQL に依存 |
| singleton が scoped に依存（直接・間接） | 実行時エラーまたは `validate()` で検出 |

CI で `container.validate()` を実行してください。


## dispose 失敗時

`@wyrly/express` の `onDisposeError` と同様、GraphQL でも `willSendResponse` / `onResponse` で
失敗を観測できます。Core v2.1+ の `scope.dispose({ onError })` も利用できます。


## 関連

- [examples/graphql-request](../examples/graphql-request/)
- [guides/SERVER_COMPONENTS.ja.md](./SERVER_COMPONENTS.ja.md)
