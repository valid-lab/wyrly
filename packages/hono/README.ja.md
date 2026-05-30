# @wyrly/hono

Hono / Cloudflare Workers 向けの request-scoped DI。`reflect-metadata` 不要で、`di()` ミドルウェアと
`getDI(c)` によりリクエストごとに 1 つの scope を扱えます。

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

- [公式ドキュメント](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=hono_ja)
- [@wyrly/core](../core/README.ja.md)
- [API](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)

## 関連パッケージ

| パッケージ       | npm      | 説明                       |
| ---------------- | -------- | -------------------------- |
| `@wyrly/core`    | あり     | コア DI                    |
| `@wyrly/next`    | あり     | Next.js App Router         |
| `@wyrly/express` | あり     | Express 5 ミドルウェア     |
| `@wyrly/hono`    | あり     | 本パッケージ               |
| `@wyrly/fastify` | あり     | Fastify 5 プラグイン       |
| `@wyrly/fresh`   | JSR のみ | Fresh 2.x                  |
| `@wyrly/graphql` | あり     | GraphQL リクエストスコープ |
| `@wyrly/yoga`    | あり     | GraphQL Yoga 5 プラグイン  |
| `@wyrly/apollo`  | あり     | Apollo Server プラグイン   |

## ライセンス

Apache-2.0
