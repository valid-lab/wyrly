# @wyrly/express

Express 向けの request-scoped DI。`reflect-metadata` 不要で、`diMiddleware` により HTTP
リクエストごとに 1 つの scope を扱えます。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/express @wyrly/core express
```

peer dependency: **express ^5.0.0**

## 要件

- [`@wyrly/core`](../core/README.ja.md) の要件
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

スコープ付きリソースの非同期クリーンアップが失敗したときに検知したい場合は `onDisposeError`
を使います。

```ts
app.use(diMiddleware(container, {
  onDisposeError(error, req) {
    console.error("request scope の破棄に失敗しました", req.path, error);
  },
}));
```

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=express_ja)
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
