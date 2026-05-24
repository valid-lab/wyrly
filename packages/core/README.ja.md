# @wyrly/core

モダン TypeScript 向けの型安全な DI。`reflect-metadata`、`emitDecoratorMetadata`、parameter
decorators は不要です。

`@wyrly/core` は、フレームワークに密結合せず、明示的な依存定義、型付き
token、標準デコレーター、リクエストスコープ、解析可能な依存グラフを使いたいときの中核パッケージです。

**ランタイム:** [Deno 2.x（JSR）](#インストールdeno--jsr) ·
[Node.js 20+ / Bun（npm）](#インストールnodejs--bun--npm)

English: [README.md](./README.md)

## Wyrly DI を選ぶ場面

- legacy decorator metadata ではなく、TypeScript 標準デコレーターで DI したい。
- interface ベースの依存を型付き token で安全に注入したい。
- Next.js、Hono、Express、Fresh、GraphQL などで request scope を扱いたい。
- CI で依存グラフを inspect / validate したい。
- DDD / クリーンアーキテクチャ向けに composition root で明示的に配線したい。

## ランタイム

| ランタイム   | レジストリ                                       | インポート               |
| ------------ | ------------------------------------------------ | ------------------------ |
| **Deno 2.x** | [JSR `@wyrly/core`](https://jsr.io/@wyrly/core)  | `jsr:@wyrly/core@^2.0.0` |
| Node.js 20+  | [npm](https://www.npmjs.com/package/@wyrly/core) | `@wyrly/core`            |
| Bun          | npm（同一パッケージ）                            | `@wyrly/core`            |

**JSR と npm の両方**から同じソースを公開しています。Deno では JSR、Node/Bun では npm
を使ってください。

## インストール（Deno / JSR）

```jsonc
// deno.json
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^2.0.0"
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

- **TypeScript 5+** と
  [TC39 標準デコレータ](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)（`experimentalDecorators: false`）
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

- [公式ドキュメント](https://docs.wyrly.dev/)
- [API リファレンス](https://github.com/valid-lab/wyrly/blob/main/API.ja.md)
- [リポジトリ README](https://github.com/valid-lab/wyrly/blob/main/README.ja.md)
- [比較ガイド](https://github.com/valid-lab/wyrly/blob/main/guides/COMPARE.ja.md)
- [Examples](https://github.com/valid-lab/wyrly/blob/main/examples/README.ja.md)
- [公開手順・ランタイム](https://github.com/valid-lab/wyrly/blob/main/PUBLISHING.ja.md)

## 関連パッケージ

| パッケージ       | Deno（JSR） | npm  | 説明                                 |
| ---------------- | ----------- | ---- | ------------------------------------ |
| `@wyrly/core`    | あり        | あり | コアコンテナ・トークン・ライフタイム |
| `@wyrly/express` | あり        | あり | Express 5 ミドルウェア               |
| `@wyrly/hono`    | あり        | あり | Hono ミドルウェア                    |
| `@wyrly/graphql` | あり        | あり | GraphQL リクエストスコープ           |
| `@wyrly/next`    | あり        | あり | Next.js App Router                   |
| `@wyrly/fresh`   | あり        | —    | Fresh 2.x（JSR のみ）                |

## ライセンス

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
