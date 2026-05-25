# apollo-graphql

Apollo Server 4 + `@wyrly/graphql` — リクエスト context と `willSendResponse` で dispose
する例です。

[graphql-request](../graphql-request/) と同じ DDD 構成・scoped `UserLoader` を使います。v2.2.0 予定:
[`@wyrly/apollo`](../../packages/apollo/) がこのライフサイクルをラップします。

English: [README.md](./README.md)

## リクエスト scope と dispose

| ルール               | 実装                                                                |
| -------------------- | ------------------------------------------------------------------- |
| 1 リクエスト 1 scope | `createRequestContext` で操作ごとに `GraphQLDIContext` を構築       |
| ローダーは scoped    | `UserLoaderToken` を `lifetime: "scoped"` + `useFactory` で登録     |
| HTTP → port token    | `configureScope` で `X-User-Id` → `CurrentUserToken`                |
| リクエスト後に破棄   | `wyrlyDisposePlugin` の `willSendResponse` で `ctx.wyrly.dispose()` |

実装: [`presentation/server.ts`](./presentation/server.ts)、
[`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts)。
[GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md) を参照。

## この example で確認できること

- `createGraphQLDIContext` を `executeOperation` と Apollo の dispose plugin と組み合わせられる。
- scoped `UserLoader` がリクエスト単位で閉じる。
- UseCase には `CurrentUserToken` を `configureScope` で渡し、`GraphQLRequestToken` は使わない。

## 構成

| レイヤー       | 役割                                      |
| -------------- | ----------------------------------------- |
| domain         | 型・port interface                        |
| application    | バッチ取得 UseCase                        |
| infrastructure | scoped `UserLoader` factory               |
| presentation   | Apollo サーバー、dispose plugin、resolver |
| composition    | DI token と container 配線                |

## 実行

```sh
deno task example:apollo-graphql
```

`server.executeOperation()` をプロセス内で実行します（HTTP リッスンなし）。

## 関連

- [guides/GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md)
- [graphql-request](../graphql-request/) — GraphQL サーバーなしの scoped DataLoader
- [yoga-graphql](../yoga-graphql/) — GraphQL Yoga 5 + Envelop plugin
