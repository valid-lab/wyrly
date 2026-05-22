# @wyrly/hono

Hono 向け Wyrly DI アダプター — `di()` ミドルウェアと `getDI(c)` でリクエストスコープ。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/hono @wyrly/core hono
```

peer dependency: **hono ^4.0.0**

Node / Bun / Cloudflare Workers でスモークテスト済み（`compat/`）。

## 要件

- [`@wyrly/core`](../core/README.ja.md) の要件
- **Hono 4.x**

## クイックスタート

```ts
import { Hono } from "hono";
import { di, getDI, type HonoDIVariables } from "@wyrly/hono";
import { createContainer } from "@wyrly/core";

const app = new Hono<{ Variables: HonoDIVariables }>();
app.use(di(createContainer()));

app.get("/users/:id", (c) => {
  const scope = getDI(c);
  return c.json({ disposed: scope.isDisposed() });
});
```

## ドキュメント

- [@wyrly/core](../core/README.ja.md)
- [API](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)

## 関連パッケージ

| パッケージ | npm | 説明 |
| ---------- | --- | ---- |
| `@wyrly/core` | あり | コア DI |
| `@wyrly/hono` | あり | 本パッケージ |
| `@wyrly/express` | あり | Express |
| `@wyrly/graphql` | あり | GraphQL |
| `@wyrly/next` | あり | Next.js |
| `@wyrly/fresh` | JSR のみ | Fresh 2.x |

## ライセンス

Apache-2.0
