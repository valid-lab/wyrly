# express-api

`@wyrly/express` の `diMiddleware` と request scope の軽量 DDD 例です。 DI token は `composition/`
に置き、domain では raw string ではなく `UserId` Value Object を使う、厳密寄りの DDD 例です。

## この example で確認できること

- Express middleware で request 由来の値を handler 前に scoped application value へマップできる。
- route params を presentation 境界で domain value に変換できる。
- Express 型を domain に漏らさず、DDD use case を request scope で扱える。

English: [README.md](./README.md)

## 実行

```sh
deno task example:express-api
```

`net` 権限が必要です（`127.0.0.1` で listen + fetch）。

## 関連

- 統合: [express-graphql](../express-graphql/)
- Hono 版: [hono-api](../hono-api/)
