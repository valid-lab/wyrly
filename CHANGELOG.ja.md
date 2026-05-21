# 変更履歴

English: [CHANGELOG.md](./CHANGELOG.md)

このリポジトリの `@wyrly/*` パッケージの変更は本ファイル（英語版と対）に記録します。

形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) を参考にし、**1.0.0** 以降は [Semantic Versioning](https://semver.org/lang/ja/) に従います。

## [Unreleased]

### 追加

- JSR 公開パイプライン（`deno publish`、`deno task publish:dry-run`）
- npm 本番公開（[dnt](https://github.com/denoland/dnt)、`deno task build:npm` / `publish:npm` → npm は 5 パッケージ、`@wyrly/fresh` は JSR のみ）

### 変更

- GitHub Actions の公開を **JSR OIDC** と **npm Trusted Publishing** に移行。手順は [PUBLISHING.ja.md](./PUBLISHING.ja.md) のワンタイム設定
- `publish:npm` に `--provenance` を付与。CI は Node 22.x
- README のインストール手順を JSR / npm / workspace の 3 経路に更新
- Next.js Server Components ガイド（[guides/SERVER_COMPONENTS.ja.md](./guides/SERVER_COMPONENTS.ja.md)）
- [examples/graphql-request](./examples/graphql-request/) の DataLoader パターン文書

## [1.0.0] - 2026-05-21

### 追加

- **`@wyrly/core`**: 型付き `token()`、`createContainer()`、`@Injectable`、明示的 provider（`useClass` / `useValue` / `useFactory` / `useExisting`）、singleton / scoped / transient、`override`、スコープの `set` / `register`、`dispose`、循環依存検出、resolve 時の lifetime 違反、`inspect()` / `validate()`、グラフ出力（`graphToJson` / `graphToDot` / `graphToMermaid`）、ローカライズされたエラー（`en` / `ja`）
- **アダプター**: `@wyrly/express`、`@wyrly/hono`、`@wyrly/fresh`、`@wyrly/graphql`、`@wyrly/next`（リクエストスコープ連携）
- **Examples**: `examples/` に実行可能サンプル 10 本（core + 各 adapter）
- **ドキュメント**: [API.ja.md](./API.ja.md)（公開 API の固定）、コントリビュータ向け [AGENT.md](./AGENT.md)（英語）

### 備考

- TypeScript 標準デコレーターのみ。`reflect-metadata`、legacy decorators、parameter decorators は非対応
- 自動 glob scan なし。composition root での手動登録が前提

### 既知の制限

- 第一級の `resolveAsync` なし（非同期 factory の DI モデルは限定的）
- core に HTML 形式の依存グラフエクスポートなし（必要なら外部ツールを利用）
- 本リポジトリに CLI は同梱しない

[1.0.0]: https://github.com/your-org/wyrly/releases/tag/v1.0.0
