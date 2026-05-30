# @wyrly/fresh

Fresh 2.x / Deno 向けの request-scoped DI。`reflect-metadata` 不要で、`di()` ミドルウェアと `withDI`
ルートハンドラを扱えます（**JSR のみ**）。

English: [README.md](./README.md)

## インストール（JSR のみ）

**npm では公開していません** — Fresh 2.x は `jsr:@fresh/core` 依存のため。

```jsonc
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^2.0.0",
    "@wyrly/fresh": "jsr:@wyrly/fresh@^2.0.0"
  }
}
```

## 要件

- **Deno 2.x** / Fresh 2.x
- JSR の [`@wyrly/core`](../core/README.ja.md)

## クイックスタート

```ts
import { createContainer } from "@wyrly/core";
import { di, withDI } from "@wyrly/fresh";

const container = createContainer();
```

詳細はリポジトリの
[examples/fresh-routes](https://github.com/valid-lab/wyrly/tree/main/examples/fresh-routes) を参照。

## ドキュメント

- [公式ドキュメント](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=fresh_ja)
- [@wyrly/core](../core/README.ja.md)
- [API](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)
- [公開手順](https://github.com/valid-lab/wyrly/blob/main/PUBLISHING.ja.md)

## 関連パッケージ

| パッケージ       | npm      | 説明                       |
| ---------------- | -------- | -------------------------- |
| `@wyrly/core`    | あり     | コア DI                    |
| `@wyrly/next`    | あり     | Next.js App Router         |
| `@wyrly/express` | あり     | Express 5 ミドルウェア     |
| `@wyrly/hono`    | あり     | Hono ミドルウェア          |
| `@wyrly/fastify` | あり     | Fastify 5 プラグイン       |
| `@wyrly/fresh`   | JSR のみ | 本パッケージ               |
| `@wyrly/graphql` | あり     | GraphQL リクエストスコープ |
| `@wyrly/yoga`    | あり     | GraphQL Yoga 5 プラグイン  |
| `@wyrly/apollo`  | あり     | Apollo Server プラグイン   |

## ライセンス

Apache-2.0
