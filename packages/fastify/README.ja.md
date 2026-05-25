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

## 関連

- [examples/fastify-api](https://github.com/valid-lab/wyrly/tree/main/examples/fastify-api)
- Fastify 上で GraphQL を使う場合は
  [`@wyrly/apollo`](https://github.com/valid-lab/wyrly/tree/main/packages/apollo) や
  [`@wyrly/yoga`](https://github.com/valid-lab/wyrly/tree/main/packages/yoga)
  と組み合わせます（GraphQL ルートは各アダプタの scope、REST は `diPlugin`）

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
