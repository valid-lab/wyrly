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

- **Deno 2.x**、**Node.js 24.x**（CI の npm Trusted Publishing。npm 11.5.1+ 必須）、ローカル dnt は Node 20.x でも可
- **JSR** スコープ `@wyrly`、**npm** org `wyrly`

**GitHub Actions では長期トークンは使いません。** [JSR OIDC](https://jsr.io/docs/publishing-packages#publishing-from-github-actions) と [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) で認証します。初回リリース前に下のワンタイム設定を完了してください。

## ワンタイム設定（初回 CI 公開の前）

`OWNER/REPO` はこのリポジトリ（例: `your-org/wyrly-oss`）に置き換えてください。

### JSR — GitHub リポジトリのリンク（6 件）

各パッケージを [jsr.io/new](https://jsr.io/new) で作成し、**Settings → GitHub repository** で `OWNER/REPO` を入力して **Link**:

- [ ] `@wyrly/core`
- [ ] `@wyrly/express`
- [ ] `@wyrly/hono`
- [ ] `@wyrly/fresh`
- [ ] `@wyrly/graphql`
- [ ] `@wyrly/next`

ワークフローは [`.github/workflows/publish.yml`](./.github/workflows/publish.yml)（ファイル名 `publish.yml`）であること。

### npm — Trusted Publisher（5 件）

org **`wyrly`** で、各パッケージに **Trusted Publisher → GitHub Actions** を登録:

| 項目 | 値 |
| ---- | --- |
| Repository | `OWNER/REPO` |
| Workflow filename | `publish.yml` |
| Environment | 空（GitHub Environment を使う場合のみ同じ名前を指定） |

対象:

- [ ] `@wyrly/core`
- [ ] `@wyrly/express`
- [ ] `@wyrly/hono`
- [ ] `@wyrly/graphql`
- [ ] `@wyrly/next`

（`@wyrly/fresh` は npm 非公開）

### JSR Score（各パッケージ Settings で手動）

リリース後、[jsr.io](https://jsr.io/) で各 `@wyrly/*` の **Settings** を開き:

| 項目 | 推奨 |
| ---- | ---- |
| **Description** | 1 文（250 字以内）。例 core: `Explicit DI for modern TypeScript — typed tokens, standard decorators, request scopes.` |
| **Runtime compatibility** | 下表参照。その他 adapter は **Deno + Node: Supported**；Bun / Cloudflare Workers は未検証なら **Unknown**。 |
| **Readme source** | デフォルト（`mod.ts` の `@module` を Overview に表示） |

| パッケージ | Deno | Node.js | Bun | Cloudflare Workers |
| ---------- | ---- | ------- | --- | ------------------ |
| `@wyrly/core` | Supported | **Supported**（CI: `compat/node`） | **Supported**（CI: `compat/bun`） | **Supported**（CI: `compat/workers`） |
| `@wyrly/hono` | Supported | **Supported**（CI: `compat/node`） | **Supported**（CI: `compat/bun`） | **Supported** |
| `@wyrly/express`, `@wyrly/graphql`, `@wyrly/next` | Supported | **Supported**（CI: `compat/node`） | **Supported**（CI: `compat/bun`） | Unknown |
| `@wyrly/fresh` | Supported | —（JSR のみ） | Unknown | Unknown |

コード側: CI の `deno task doc:lint`、`no-slow-types` の lint、`--allow-slow-types` なしの `publish:dry-run`、**`deno task test:compat`**（Node + Bun は npm 全パッケージ、Workers は core + hono）。

## 利用者の import

### Deno / JSR

```jsonc
{ "imports": { "@wyrly/core": "jsr:@wyrly/core@^1.0.0" } }
```

### Node / npm

```sh
npm install @wyrly/core
```

**`@wyrly/fresh`:** `jsr:@wyrly/fresh` のみ。Fresh 2.x は `jsr:@fresh/core` 依存で、npm に `@fresh/core` はありません。

## npm ビルド（dnt）

**README / keywords:** リリース前に `packages/<name>/README.md`（npm 表示・英語）と `README.ja.md`（日本語）を編集。`keywords` / `homepage` / `bugs` は [`scripts/dnt/package-metadata.ts`](scripts/dnt/package-metadata.ts)。`deno task build:npm` が `README.md` を `packages/*/npm/` にコピーし、`package.json` にメタデータをマージします。

```sh
deno task check:npm-readme  # 6 パッケージ分の README 存在確認
deno task build:npm
deno task build:npm:core   # core のみ
```

成果物は `packages/*/npm/`（gitignore、ESM のみ）。

## ローカル dry-run

```sh
deno task ci
deno task publish:dry-run
deno task build:npm
deno task publish:npm:dry-run
```

## 手動リリース（ローカル）

本番は **タグ push → GitHub Actions** を推奨します。ローカルから出す場合:

1. 6 パッケージ（JSR）の version 更新（npm は 5 パッケージ、fresh を除く）
2. CHANGELOG 更新
3. `deno task ci`
4. `deno task publish:dry-run`
5. **JSR:** `deno task publish:jsr`（ブラウザで承認）
6. `deno task build:npm` → `deno task publish:npm:dry-run` → **npm:** `npm login` 後に `deno task publish:npm`（**core が先**）
7. タグ `vX.Y.Z` を push（CI に任せる場合は tag のみ）

## GitHub Actions

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml) — タグ `v*` または `workflow_dispatch`。

**リポジトリシークレットは不要**（JSR リンクと npm Trusted Publisher 設定済みの場合）。`id-token: write` で OIDC 認証します。

## トラブルシュート

| 現象 | 対処 |
| ---- | ---- |
| Actions で JSR 認証失敗 | 各パッケージの Settings で `OWNER/REPO` をリンク |
| JSR `globalTypeAugmentation` | 公開コードに `declare global` / `declare module` を置かない。export 型（`ExpressRequestWithDI`、`HonoDIVariables`、`FreshDIState` 等）を使う |
| Actions で npm `404` / “not in this registry”（provenance は成功している場合あり） | CI を **Node 24.x** に（Node 22 は npm 10.x で誤った 404 になりやすい）。`publish.yml` 修正後に再実行 |
| Actions で npm `403` | Trusted Publisher: `valid-lab/wyrly`、`publish.yml`、**Allow npm publish**。CI は Node 24+ / npm 11.5.1+ |
| ローカルで `provider: null`（provenance） | ローカルは `deno task publish:npm`。`--provenance` は CI の `publish:npm:ci` のみ |
| provenance / Trusted Publishing エラー（CI） | Trusted Publisher 設定と `publish:npm:ci` を確認 |
| JSR Score が低い（readme / examples / symbol doc） | `packages/*/mod.ts` に `@module` と `@example` を追加。`deno task doc:lint` を通す |
| JSR Score「slow types」（0/5） | `deno lint --rules-include=no-slow-types packages/` で修正。`--allow-slow-types` なしで publish |
| JSR Score の runtime / description（0/1） | JSR の **Description** と **Runtime compatibility** を Settings で設定（`deno.json` では不可） |
| `deno task test:compat` が失敗 | 先に `deno task build:npm:compat`；Node/npm と Bun のインストールを確認；`compat/node` / `compat/bun` / `compat/workers` を参照 |
