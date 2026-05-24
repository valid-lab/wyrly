# @wyrly/next

Next.js 15+ App Router 向けの request-scoped DI。`reflect-metadata` 不要で、Route
Handler（`withDI`）、Server Action（`withActionDI`）、Server
Components（`createServerDI`）を扱えます。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/next @wyrly/core next react
```

peer: **next ^15.0.0**、**react ^19.0.0**

## 要件

- [`@wyrly/core`](../core/README.ja.md) の要件
- **Next.js 15+**（App Router）

## クイックスタート（Route Handler）

```ts
import { withDI } from "@wyrly/next";
import { createContainer } from "@wyrly/core";

const container = createContainer();

export const GET = withDI(container, async (_req, { di }) => {
  const usecase = di.resolve(MyUseCase);
  return Response.json(await usecase.run());
});
```

Server Components は `createServerDI` —
[API.ja.md](https://github.com/valid-lab/wyrly/blob/main/API.ja.md) を参照。

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/)
- [@wyrly/core](../core/README.ja.md)
- [API](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)

## 関連パッケージ

| パッケージ       | npm      | 説明         |
| ---------------- | -------- | ------------ |
| `@wyrly/core`    | あり     | コア DI      |
| `@wyrly/next`    | あり     | 本パッケージ |
| `@wyrly/express` | あり     | Express      |
| `@wyrly/hono`    | あり     | Hono         |
| `@wyrly/graphql` | あり     | GraphQL      |
| `@wyrly/fresh`   | JSR のみ | Fresh 2.x    |

## ライセンス

Apache-2.0
