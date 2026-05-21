# `@wyrly/*` の公開手順

English: [PUBLISHING.md](./PUBLISHING.md)

**JSR** に 6 パッケージ、**npm** に 5 パッケージを公開します。`@wyrly/fresh` は Fresh 2.x が npm 非対応のため **JSR のみ**です。

| パッケージ       | JSR                  | npm（registry.npmjs.org） |
| ---------------- | -------------------- | ------------------------- |
| `@wyrly/core`    | `jsr:@wyrly/core`    | `@wyrly/core`             |
| `@wyrly/express` | `jsr:@wyrly/express` | `@wyrly/express`          |
| `@wyrly/hono`    | `jsr:@wyrly/hono`    | `@wyrly/hono`             |
| `@wyrly/fresh`   | `jsr:@wyrly/fresh`   | —（JSR のみ）             |
| `@wyrly/graphql` | `jsr:@wyrly/graphql` | `@wyrly/graphql`          |
| `@wyrly/next`    | `jsr:@wyrly/next`    | `@wyrly/next`             |

`packages/*/deno.json` の version を揃え、タグ `vX.Y.Z` でまとめてリリースします。

## 前提

- **Deno 2.x**、**Node.js 20.x**、**npm**
- `JSR_TOKEN`、`NPM_TOKEN`（GitHub Secrets）

## 利用者の import

### Deno / JSR

```jsonc
{ "imports": { "@wyrly/core": "jsr:@wyrly/core@^1.0.0" } }
```

### Node / npm

```sh
npm install @wyrly/core
```

```ts
import { createContainer, token } from "@wyrly/core";
```

**`@wyrly/fresh`:** `jsr:@wyrly/fresh` のみ。Fresh 2.x は `jsr:@fresh/core` 依存で、npm に `@fresh/core` はありません。

## npm ビルド（dnt）

```sh
deno task build:npm
deno task build:npm:core   # core のみ
```

成果物は `packages/*/npm/`（gitignore、ESM のみ）。

## 手動リリース

1. 6 パッケージ（JSR）の version 更新（npm は 5 パッケージ、fresh を除く）
2. CHANGELOG 更新
3. `deno task ci`
4. `deno task publish:dry-run` → `deno task publish:jsr`
5. `deno task build:npm` → `deno task publish:npm:dry-run` → `deno task publish:npm`（**core が先**）
6. タグ push

## GitHub Actions

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml) — `JSR_TOKEN` と `NPM_TOKEN` を設定してください。
