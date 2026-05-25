# yoga-graphql

GraphQL Yoga 5 + `@wyrly/graphql` — 1 GraphQL リクエスト = 1 DI scope を Envelop plugin で dispose
する例です。

[graphql-request](../graphql-request/) と同じ DDD 構成・scoped `UserLoader` を使います。v2.2.0 予定:
[`@wyrly/yoga`](../../packages/yoga/) がこのライフサイクルをラップします。

English: [README.md](./README.md)

## リクエスト scope と dispose

| ルール               | 実装                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 1 リクエスト 1 scope | `wyrlyDIPlugin` の `onRequest` で `createGraphQLDIContext`                                           |
| ローダーは scoped    | `UserLoaderToken` を `lifetime: "scoped"` + `useFactory` で登録                                      |
| HTTP → port token    | `configureScope` で `X-User-Id` → `CurrentUserToken`                                                 |
| リクエスト後に破棄   | `onResponse` で `ctx.wyrly.dispose()`（[GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md)） |

実装: [`presentation/server.ts`](./presentation/server.ts)、
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts)

## この example で確認できること

- `createGraphQLDIContext` を GraphQL Yoga の plugin と resolver `context` と組み合わせられる。
- DataLoader 風の scoped `UserLoader` を 1 GraphQL リクエスト内で共有できる。
- UseCase は `GraphQLRequestToken` に依存せず、`CurrentUserToken` を composition root 境界で
  設定できる。

## 構成

| レイヤー       | 役割                                     |
| -------------- | ---------------------------------------- |
| domain         | 型・port interface                       |
| application    | バッチ取得 UseCase                       |
| infrastructure | scoped `UserLoader` factory              |
| presentation   | Yoga サーバー、`wyrlyDIPlugin`、resolver |
| composition    | DI token と container 配線               |

## 実行

```sh
deno task example:yoga-graphql
```

`yoga.fetch()` でプロセス内実行します（TCP リッスンなし）。実 HTTP サーバで試す場合は
`createYogaServer` を `Deno.serve` などでラップしてください。

## 関連

- [guides/GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md)
- [graphql-request](../graphql-request/) — GraphQL サーバーなしの scoped DataLoader
- [apollo-graphql](../apollo-graphql/) — Apollo Server 4 + `willSendResponse`
