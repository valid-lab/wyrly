# provider-patterns

`useValue` / `useFactory` / `useExisting` の 3 パターンを 1 つの composition root で示します。

English: [README.md](./README.md)

## 学ぶこと

- 定数・設定値の `useValue`
- scope 付き `useFactory`
- エイリアス登録の `useExisting`

## 実行

```sh
deno task example:provider-patterns
```

## 次のステップ: リクエスト scoped factory

ルートの `useFactory` のあと、**リクエストごとの scope** に紐づく factory（GraphQL
DataLoader）を学ぶ:

→ [graphql-request](../graphql-request/) — `lifetime: "scoped"` + `createGraphQLDIContext`

## 関連

| トピック          | Example                                |
| ----------------- | -------------------------------------- |
| scoped DataLoader | [graphql-request](../graphql-request/) |
| Express + GraphQL | [express-graphql](../express-graphql/) |
| Core 入門         | [basic-ddd](../basic-ddd/)             |
