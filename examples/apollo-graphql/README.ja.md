# apollo-graphql

Apollo Server 4 + [`@wyrly/apollo`](../../packages/apollo/) — `apolloDIPlugin` で 1 GraphQL 操作 = 1
DI scope、`willSendResponse` で dispose します。

[graphql-request](../graphql-request/) と同じ DDD 構成・scoped `UserLoader` を使います。

English: [README.md](./README.md)

## リクエスト scope と dispose

| ルール            | 実装                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| 1 操作 1 scope    | `apolloDIPlugin` の `requestDidStart`（内部で `@wyrly/graphql` に委譲）                               |
| ローダーは scoped | `UserLoaderToken` を `lifetime: "scoped"` + `useFactory` で登録                                       |
| HTTP → port token | `configureScope` で `X-User-Id` → `CurrentUserToken`                                                  |
| 操作後に破棄      | `willSendResponse` で scope を dispose（[GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md)） |

## 実行

```sh
deno task example:apollo-graphql
```

`executeOperation()` でプロセス内実行します（HTTP リッスンなし）。

## 関連

- [guides/GRAPHQL_DISPOSE.ja.md](../../guides/GRAPHQL_DISPOSE.ja.md)
- [apollo-express-graphql](../apollo-express-graphql/)
- [yoga-graphql](../yoga-graphql/)
