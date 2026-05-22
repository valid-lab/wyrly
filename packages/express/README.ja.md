# @wyrly/express

Express 向け Wyrly DI アダプター — `diMiddleware` で HTTP リクエストごとにスコープを張ります。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/express @wyrly/core express
```

peer dependency: **express ^5.0.0**

## 要件

- [`@wyrly/core`](../core/README.ja.md) の要件を満たすこと
- **Express 5.x**

## クイックスタート

```ts
import express from "express";
import { asExpressRequestWithDI, diMiddleware } from "@wyrly/express";
import { createContainer } from "@wyrly/core";

const app = express();
const container = createContainer();
app.use(diMiddleware(container));

app.get("/users/:id", (req, res) => {
  const di = asExpressRequestWithDI(req).di;
  res.json({ ok: true });
});
```

## ドキュメント

- [@wyrly/core](../core/README.ja.md)
- [API](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)
- [リポジトリ README](https://github.com/valid-lab/wyrly/blob/main/README.ja.md)

## 関連パッケージ

| パッケージ       | npm      | 説明         |
| ---------------- | -------- | ------------ |
| `@wyrly/core`    | あり     | コア DI      |
| `@wyrly/express` | あり     | 本パッケージ |
| `@wyrly/hono`    | あり     | Hono         |
| `@wyrly/graphql` | あり     | GraphQL      |
| `@wyrly/next`    | あり     | Next.js      |
| `@wyrly/fresh`   | JSR のみ | Fresh 2.x    |

## ライセンス

Apache-2.0
