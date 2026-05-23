# fresh-routes

`@wyrly/fresh` の `di()` middleware（`App`）と `withDI()` handler（直接呼び出し）の対比例です。 DI
token は `composition/` に置き、domain では raw string ではなく `UserId` Value Object
を使う、厳密寄りの DDD 例です。

## この example で確認できること

- Fresh middleware と route handler が同じ application / domain 境界を共有できる。
- request header や route params を presentation 境界で scoped value と domain value に変換できる。

English: [README.md](./README.md)

## 実行

```sh
deno task example:fresh-routes
```

## 関連

- Hono: [hono-api](../hono-api/)
