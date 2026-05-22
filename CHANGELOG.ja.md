# 変更履歴

English: [CHANGELOG.md](./CHANGELOG.md)

このリポジトリの `@wyrly/*` パッケージの変更は本ファイル（英語版と対）に記録します。

形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) を参考にし、**1.0.0** 以降は [Semantic Versioning](https://semver.org/lang/ja/) に従います。

## [Unreleased]

## [1.0.4] - 2026-05-22

### 変更

- JSR 向けドキュメント: 6 パッケージの `mod.ts` に `@module` と `@example`、`@wyrly/core` の公開 export に JSDoc
- adapter の token に明示的 `Token<T>`（publish から `--allow-slow-types` を削除）
- CI: `deno task doc:lint`、`no-slow-types` lint、slow-types なしの publish dry-run

### 修正

- Publish workflow の npm を Node **24.x** に（Trusted Publishing / npm ≥ 11.5.1）

## [1.0.3] - 2026-05-22

### 変更

- **1.0.2** の JSR / npm が一部のみ公開だったため、同一内容を **1.0.3** で再リリース（既存バージョンの上書きは不可）
- `examples/express-api` / `examples/hono-api` を export 型ベースの adapter API に合わせて更新
- `README.ja.md` を `README.md` と同等の全文日本語版に更新

## [1.0.2] - 2026-05-22

### 修正

- **`@wyrly/express`**: JSR で禁止の `declare global` を削除し、`ExpressRequestWithDI` と `asExpressRequestWithDI` を export
- **`@wyrly/hono`**: JSR で禁止の `declare module "hono"` を削除し、`HonoDIVariables`・`getDI`・`diVariableKey` を export

## [1.0.1] - 2026-05-22

### 修正

- npm の `repository.url` を `https://github.com/valid-lab/wyrly` に修正（誤: `wyrly/wyrly`）。monorepo の `directory` は `packages/<name>`

## [1.0.0] - 2026-05-21

### 追加

- **`@wyrly/core`**: 型付き `token()`、`createContainer()`、`@Injectable`、明示的 provider（`useClass` / `useValue` / `useFactory` / `useExisting`）、singleton / scoped / transient、`override`、スコープの `set` / `register`、`dispose`、循環依存検出、resolve 時の lifetime 違反、`inspect()` / `validate()`、グラフ出力（`graphToJson` / `graphToDot` / `graphToMermaid`）、ローカライズされたエラー（`en` / `ja`）
- **アダプター**: `@wyrly/express`、`@wyrly/hono`、`@wyrly/fresh`、`@wyrly/graphql`、`@wyrly/next`（リクエストスコープ連携）
- **Examples**: `examples/` に実行可能サンプル 10 本（core + 各 adapter）
- **ドキュメント**: [API.ja.md](./API.ja.md)（公開 API の固定）、コントリビュータ向け [AGENT.md](./AGENT.md)（英語）
- JSR 公開パイプライン（`deno publish`、`deno task publish:dry-run`、[PUBLISHING.ja.md](./PUBLISHING.ja.md)）
- npm 本番公開（[dnt](https://github.com/denoland/dnt)、`deno task build:npm` / `publish:npm` → npm は 5 パッケージ、`@wyrly/fresh` は JSR のみ）
- Next.js Server Components ガイド（[guides/SERVER_COMPONENTS.ja.md](./guides/SERVER_COMPONENTS.ja.md)）
- [examples/graphql-request](./examples/graphql-request/) の DataLoader パターン文書

### 変更

- GitHub Actions の公開を **JSR OIDC** と **npm Trusted Publishing** に移行。手順は [PUBLISHING.ja.md](./PUBLISHING.ja.md) のワンタイム設定
- CI 用 `publish:npm:ci` に `--provenance` を付与（ローカル `publish:npm` には付けない）。CI は Node 22.x
- README のインストール手順を JSR / npm / workspace の 3 経路に更新

### 備考

- TypeScript 標準デコレーターのみ。`reflect-metadata`、legacy decorators、parameter decorators は非対応
- 自動 glob scan なし。composition root での手動登録が前提

### 既知の制限

- 第一級の `resolveAsync` なし（非同期 factory の DI モデルは限定的）

[1.0.4]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.4
[1.0.3]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.3
[1.0.2]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.2
[1.0.1]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.1
[1.0.0]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.0
