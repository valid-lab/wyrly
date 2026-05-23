# graphql-request

`@wyrly/graphql` の `createGraphQLDIContext` と、scoped **DataLoader
風**バッチローダーの例です（GraphQL サーバーは立てません）。

v0.3 の **DataLoader 連携パターン**の参照実装です: 1 GraphQL リクエスト = 1 DI scope = 1
ローダーインスタンス。

English: [README.md](./README.md)

## DataLoader パターン

| ルール               | 実装                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| 1 リクエスト 1 scope | presentation で `createGraphQLDIContext(appContainer)`                                   |
| ローダーは scoped    | `UserLoaderToken` を `lifetime: "scoped"` + `useFactory` で登録                          |
| バッチ取得           | `GetUsersByIdsUseCase` が複数 ID をまとめて取得。`load(id)` は scope 内 `Map` で重複排除 |
| リクエスト後に破棄   | 疑似リクエスト終了時に `ctx.dispose()`                                                   |

実装: [`infrastructure/user_loader.ts`](./infrastructure/user_loader.ts)

本番では composition root で同様に登録し、resolver から `ctx.di.resolve(UserLoaderToken)`
します。[`createGraphQLDIContext`](../../packages/graphql/context.ts) を参照。

## この example で確認できること

- GraphQL リクエストごとに 1 つの DI scope と 1 つの scoped loader instance を所有できる。
- DataLoader 風の request cache を通常の scoped dependency として表現できる。
- resolver は global に依存を隠さず、`ctx.di` から依存を解決できる。

## 構成

| レイヤー       | 役割                            |
| -------------- | ------------------------------- |
| domain         | 型・port interface              |
| application    | バッチ取得 UseCase              |
| infrastructure | scoped `UserLoader` factory     |
| presentation   | 疑似 resolver + `ctx.dispose()` |
| composition    | DI token と container 配線      |

## 実行

```sh
deno task example:graphql-request
```

## 関連

- 統合: [express-graphql](../express-graphql/)
- 前段: [provider-patterns](../provider-patterns/)（`useFactory`）
