# @wyrly/fastify

Fastify 5 向けのリクエストスコープ DI です。`diPlugin()` と `getDI(request)` で 1 HTTP リクエスト =
1 scope を扱います。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/fastify @wyrly/core fastify
```

Peer dependency: **fastify ^5.0.0**。内部で **fastify-plugin** を使い、ルート登録後の hook
も適用されます。

## クイックスタート

```ts
import Fastify from "fastify";
import { diPlugin, getDI } from "@wyrly/fastify";
import { createContainer } from "@wyrly/core";

const app = Fastify();
await app.register(diPlugin(createContainer()));

app.get("/users/:id", async (request) => {
  const di = getDI(request);
  return { ok: true };
});
```

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=fastify_ja)
- [@wyrly/core](../core/README.ja.md)
- [examples/fastify-api](https://github.com/valid-lab/wyrly/tree/main/examples/fastify-api)
- Fastify 上で GraphQL を使う場合は [`@wyrly/apollo`](../apollo/README.ja.md) や
  [`@wyrly/yoga`](../yoga/README.ja.md) と組み合わせます

## 関連パッケージ

| パッケージ       | npm      | 説明                       |
| ---------------- | -------- | -------------------------- |
| `@wyrly/core`    | あり     | コア DI                    |
| `@wyrly/next`    | あり     | Next.js App Router         |
| `@wyrly/express` | あり     | Express 5 ミドルウェア     |
| `@wyrly/hono`    | あり     | Hono ミドルウェア          |
| `@wyrly/fastify` | あり     | 本パッケージ               |
| `@wyrly/fresh`   | JSR のみ | Fresh 2.x                  |
| `@wyrly/graphql` | あり     | GraphQL リクエストスコープ |
| `@wyrly/yoga`    | あり     | GraphQL Yoga 5 プラグイン  |
| `@wyrly/apollo`  | あり     | Apollo Server プラグイン   |

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
