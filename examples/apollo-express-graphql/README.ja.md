# apollo-express-graphql

Express 5 + Apollo Server 4 + [`@wyrly/express`](../../packages/express/) +
[`@wyrly/apollo`](../../packages/apollo/) — 同一アプリで HTTP middleware と GraphQL plugin が
それぞれリクエスト scope を持つ例です。

English: [README.md](./README.md)

## リクエスト scope

| パス            | scope   | 配線                                                 |
| --------------- | ------- | ---------------------------------------------------- |
| `GET /health`   | Express | `diMiddleware` + `mapCurrentUser`                    |
| `POST /graphql` | Apollo  | `apolloDIPlugin` + `configureScope` → `ctx.wyrly.di` |

GraphQL resolver は **`ctx.wyrly.di`** を使います（Express の `req.di` ではありません）。

## 実行

```sh
deno task example:apollo-express-graphql
```

ローカルサーバを起動し `/health` と `/graphql` を叩いて終了します。

## 関連

- [apollo-graphql](../apollo-graphql/)
- [express-api](../express-api/)
