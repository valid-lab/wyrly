# graphql-request

`@wyrly/graphql` の `createGraphQLDIContext` と scoped DataLoader パターンの例です（GraphQL サーバーは立てません）。

## 構成

| レイヤー | ファイル | 役割 |
| -------- | -------- | ---- |
| domain | `domain/user.ts` | 型・port token |
| application | `application/get_users.ts` | バッチ取得 UseCase |
| infrastructure | `infrastructure/user_loader.ts` | scoped `UserLoader` factory |
| presentation | `presentation/resolvers.ts` | 疑似 resolver + `ctx.dispose()` |

## 実行

```sh
deno task example:graphql-request
```

## 関連

- 統合: [express-graphql](../express-graphql/)
- Core: [provider-patterns](../provider-patterns/)（`useFactory`）
