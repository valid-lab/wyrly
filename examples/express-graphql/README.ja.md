# express-graphql

`@wyrly/express` + `@wyrly/graphql` で 1 リクエスト = 1 GraphQL DI scope の例です。

`POST /graphql` は本格パーサなしで `operation` 名で分岐するスタブです。

## 実行

```sh
deno task example:express-graphql
```

## 関連

- GraphQL のみ: [graphql-request](../graphql-request/)
