# @wyrly/graphql

GraphQL / DataLoader 風 resolver 向けの request-scoped DI。`reflect-metadata` 不要で、
`createGraphQLDIContext` によりリクエストごとに 1 つの scope を扱えます。

English: [README.md](./README.md)

## インストール

```sh
npm install @wyrly/graphql @wyrly/core
```

`Request` / `Response` を渡せる GraphQL サーバと組み合わせてください。

## 要件

- [`@wyrly/core`](../core/README.ja.md) の要件

## クイックスタート

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";
import { createContainer } from "@wyrly/core";

const container = createContainer();

const context = async ({ req, res }: { req: Request; res: Response }) =>
  createGraphQLDIContext(container, { request: req, response: res });
```

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/)
- [@wyrly/core](../core/README.ja.md)
- [API](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)

## 関連パッケージ

| パッケージ       | npm      | 説明         |
| ---------------- | -------- | ------------ |
| `@wyrly/core`    | あり     | コア DI      |
| `@wyrly/graphql` | あり     | 本パッケージ |
| `@wyrly/express` | あり     | Express      |
| `@wyrly/hono`    | あり     | Hono         |
| `@wyrly/next`    | あり     | Next.js      |
| `@wyrly/fresh`   | JSR のみ | Fresh 2.x    |

## ライセンス

Apache-2.0
