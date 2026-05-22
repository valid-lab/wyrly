# @wyrly/core

モダン TypeScript 向けの明示的 DI — 型付きトークン、標準デコレータ、リクエストスコープ。

**ランタイム:** [Deno 2.x（JSR）](#インストールdeno--jsr) · [Node.js 20+ / Bun（npm）](#インストールnodejs--bun--npm)

English: [README.md](./README.md)

## ランタイム

| ランタイム | レジストリ | インポート |
| ---------- | ---------- | ---------- |
| **Deno 2.x** | [JSR `@wyrly/core`](https://jsr.io/@wyrly/core) | `jsr:@wyrly/core@^1.0.5` |
| Node.js 20+ | [npm](https://www.npmjs.com/package/@wyrly/core) | `@wyrly/core` |
| Bun | npm（同一パッケージ） | `@wyrly/core` |

**JSR と npm の両方**から同じソースを公開しています。Deno では JSR、Node/Bun では npm を使ってください。

## インストール（Deno / JSR）

```jsonc
// deno.json
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^1.0.5"
  }
}
```

```sh
deno add jsr:@wyrly/core
```

```ts
import { createContainer, Injectable, token } from "@wyrly/core";
```

パッケージページ: [jsr.io/@wyrly/core](https://jsr.io/@wyrly/core)

## インストール（Node.js / Bun / npm）

```sh
npm install @wyrly/core
# bun add @wyrly/core
```

## 要件

- **TypeScript 5+** と [TC39 標準デコレータ](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)（`experimentalDecorators: false`）
- **ESM**（Node/Bun では `"type": "module"` 推奨）
- **Deno 2.x**、**Node.js 20+**、**Bun**、または対応バンドラー

`reflect-metadata`・`emitDecoratorMetadata`・パラメータデコレータは不要です。

## クイックスタート

```ts
import { createContainer, Injectable, token } from "@wyrly/core";

const RepoToken = token<{ findById(id: string): Promise<unknown> }>("Repo");

@Injectable({ deps: [RepoToken], lifetime: "scoped" })
class GetUser {
  constructor(private readonly repo: { findById(id: string): Promise<unknown> }) {}
}

const container = createContainer();
container.register(RepoToken, {
  useValue: { findById: async () => null },
  lifetime: "scoped",
});
container.register(GetUser);

const scope = container.createScope();
try {
  scope.resolve(GetUser);
} finally {
  await scope.dispose();
}
```

## ドキュメント

- [API リファレンス](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)
- [リポジトリ README](https://github.com/valid-lab/wyrly/blob/main/README.ja.md)
- [公開手順・ランタイム](https://github.com/valid-lab/wyrly/blob/main/PUBLISHING.ja.md)

## 関連パッケージ

| パッケージ | Deno（JSR） | npm | 説明 |
| ---------- | ----------- | --- | ---- |
| `@wyrly/core` | あり | あり | コアコンテナ・トークン・ライフタイム |
| `@wyrly/express` | あり | あり | Express 5 ミドルウェア |
| `@wyrly/hono` | あり | あり | Hono ミドルウェア |
| `@wyrly/graphql` | あり | あり | GraphQL リクエストスコープ |
| `@wyrly/next` | あり | あり | Next.js App Router |
| `@wyrly/fresh` | あり | — | Fresh 2.x（JSR のみ） |

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
