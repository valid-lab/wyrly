# yoga-graphql

GraphQL Yoga 5 + [`@wyrly/yoga`](../../packages/yoga/) — `yogaDIPlugin` と `yogaContext` で 1
GraphQL リクエスト = 1 DI scope を扱う例です。

[graphql-request](../graphql-request/) と同じ DDD 構成・scoped `UserLoader` を使います。

English: [README.md](./README.md)

## リクエスト scope と dispose

| ルール               | 実装                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1 リクエスト 1 scope | `yogaDIPlugin` の `onRequest`（内部で `@wyrly/graphql` に委譲）                                                   |
| ローダーは scoped    | `UserLoaderToken` を `lifetime: "scoped"` + `useFactory` で登録                                                   |
| HTTP → port token    | `configureScope` で `X-User-Id` → `CurrentUserToken`                                                              |
| リクエスト後に破棄   | `yogaDIPlugin` の `onResponse` で scope を dispose（[GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md)） |

実装: [`presentation/server.ts`](./presentation/server.ts)、
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts)

## この example で確認できること

- `@wyrly/yoga` を GraphQL Yoga の plugin と resolver `context` と組み合わせられる。
- DataLoader 風の scoped `UserLoader` を 1 GraphQL リクエスト内で共有できる。
- UseCase は `GraphQLRequestToken` に依存せず、`CurrentUserToken` を composition root 境界で
  設定できる。

## 構成

| レイヤー       | 役割                                    |
| -------------- | --------------------------------------- |
| domain         | 型・port interface                      |
| application    | バッチ取得 UseCase                      |
| infrastructure | scoped `UserLoader` factory             |
| presentation   | Yoga サーバー、`yogaDIPlugin`、resolver |
| composition    | DI token と container 配線              |

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
