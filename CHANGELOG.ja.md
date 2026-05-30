# 変更履歴

English: [CHANGELOG.md](./CHANGELOG.md)

このリポジトリの `@wyrly/*` パッケージの変更は本ファイル（英語版と対）に記録します。

形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) を参考にし、**1.0.0** 以降は [Semantic Versioning](https://semver.org/lang/ja/) に従います。

## [Unreleased]

### 変更

- **`@wyrly/core`**: キャッシュ済み singleton/scoped の resolve を高速化（ホットパス最適化。挙動は不変）。
- **`@wyrly/core`**: Phase 2 resolve 最適化 — scope-local binding が無い場合の ultra-fast cache path、scope 生成時の遅延確保、`displayName` の遅延計算（挙動は不変）。
- **`@wyrly/core`**: request scope resolve 最適化 — scoped 向け ultra-fast path、scope Map の lazy 確保、materialize の重複 cache lookup 削除（挙動は不変）。
- **`@wyrly/core`**: Phase 3 — register 時 resolve plan（dep key 事前コンパイル）、register 時 `displayName` 省略、inner root resolve fast path、`Scope.disposeSync()`（挙動は不変）。
- **`@wyrly/core`**: Phase 4 — cold start 向け register 最適化: dep key の初回 resolve 時コンパイル、単一 Map レジストリ（`#registry` + resolve plan の二重 Map 統合）、inner root scope の lazy 生成、明示 deps/lifetime 時の `useClass` fast path（挙動は不変）。
- **`@wyrly/core`**: Phase 5 — `registerMany()`、scope プール、dense scoped cache、frozen scoped graph fast path、register 時の zero-deps dep-key 共有。tsyringe/inversify の `request_scope` ベンチ公平性修正（挙動は不変）。
- **`@wyrly/core`**: Phase 5C — frozen singleton graph（root 一括 materialize）、初回 resolve 時の `compileAllDepKeys`、`registerMany` バッチ正規化 fast path、singleton-only 時の frozen scoped invalidate スキップ（挙動は不変）。
- **`@wyrly/core`**: Phase 6 — Bootstrap Compiler: `depSlotIndices`、dense `singletonBySlot` キャッシュ、`registerMany` で dep インデックス eager finalize、初回 resolve/scope で frozen plan 構築、dense `ResolvePlan`（挙動は不変）。
- **`@wyrly/core`**: Phase 6.1 — ハイブリッド bootstrap: singleton は `singletonCache` 直参照と frozen materialize 時の lazy `depKeys`（5C 相当）、scoped frozen materialize は `depSlotIndices` のまま、`registerMany` finalize では scoped グラフのみ `compileScopedDepSlotIndices`（挙動は不変）。

## [2.2.1] - 2026-05-25

### 修正

- **`@wyrly/fastify`**: 同期 `onRequest` hook で `done()` を呼ぶよう修正（リクエストが進まず 408
  Client Timeout になる問題を解消）。

## [2.2.0] - 2026-05-25

### Added

- **`@wyrly/yoga`** — GraphQL Yoga 5 向け Inbound Adapter: `yogaDIPlugin`、`yogaContext`、
  `createYogaDIContext`（`@wyrly/graphql` に委譲）、GraphQL token の re-export。
- **`@wyrly/apollo`** — Apollo Server 4+ 向け Inbound Adapter: `apolloDIPlugin`、
  `createApolloDIContext`、`toFetchRequest`、Apollo/GraphQL token。
- **`@wyrly/fastify`** — Fastify 5 向け Inbound Adapter: `diPlugin`、`getDI`、request/reply token
  （ルートレベル hook のため `fastify-plugin` を使用）。
- `examples/fastify-api` を追加。
- `examples/yoga-graphql` を `@wyrly/yoga` に移行。
- `examples/apollo-graphql` を `@wyrly/apollo` に移行。
- `examples/apollo-express-graphql` を追加。
- [guides/GRAPHQL_DISPOSE.ja.md](./guides/GRAPHQL_DISPOSE.ja.md): 公式 Yoga / Apollo plugin 節を追加。

## [2.1.0] - 2026-05-25

### 追加

- `@wyrly/core` に `Scope.createChildScope()`（リクエスト内のネスト単位）。
- `@wyrly/core` に `Scope.dispose({ onError })`（dispose 失敗のフック）。
- `validate()` に `transitive_singleton_depends_on_scoped`（error）、
  `injectable_deps_mismatch` / `injectable_lifetime_mismatch`（warning）。
- `ScopeHasActiveChildrenError`（子 scope が残っている親の dispose）。
- ガイド [guides/GRAPHQL_DISPOSE.ja.md](./guides/GRAPHQL_DISPOSE.ja.md)。
- 例: `examples/yoga-graphql`、`examples/apollo-graphql`。

### 変更

- 子 scope は親の scoped インスタンスと `set()` 値を参照可能。新しい scoped は解決した scope にのみ格納。
- `@wyrly/express` の `diMiddleware` が `scope.dispose({ onError })` に委譲。

## [2.0.0] - 2026-05-23

### 変更

- **Breaking**: `FactoryProvider.deps` は必須になりました。factory の依存は宣言済み token
  から解決され、`useFactory(scope, ...deps)` に渡されます。これにより `inspect()` /
  `validate()` が実行時と同じ依存グラフを見られます。
- DDD examples は DI token を `domain/` ではなく `composition/tokens.ts` に置き、use case
  の配線を `composition/container.ts` に集約しました。
- `examples/next-ddd`、`examples/fresh-routes`、`examples/express-api` は `UserId` Value
  Object とリクエスト由来の `CurrentUser` を示す構成になりました。

### 追加

- `@wyrly/express` に `diMiddleware(container, { onDisposeError })` を追加し、`finish` /
  `close` 後の非同期 scope 破棄エラーを観測できるようにしました。

## [1.0.6] - 2026-05-22

### 追加

- `deno task ci:deno`（Deno のみ）とフル `deno task ci`（JSR dry-run、`test:compat`、npm dry-run を含む）
- [CONTRIBUTING.md](./CONTRIBUTING.md) / [CONTRIBUTING.ja.md](./CONTRIBUTING.ja.md) と [SECURITY.md](./SECURITY.md) / [SECURITY.ja.md](./SECURITY.ja.md)
- README に CI / JSR / npm / License バッジ

### 変更

- GitHub Actions [ci.yml](./.github/workflows/ci.yml): 1 ジョブで `deno task ci`（Deno + Node + Bun）
- [publish.yml](./.github/workflows/publish.yml): 公開前 `deno task ci` に compat を含む。重複 dry-run ステップを削除
- `@wyrly/hono` / `@wyrly/next`: パッケージ公開型（`HonoContext` 等）を整理。`doc:lint` は framework の `private-type-ref` のため従来どおり 4 パッケージのみ
- [PUBLISHING.ja.md](./PUBLISHING.ja.md): パッケージ別 JSR Runtime チェックリスト（compat CI と整合）
- ドキュメント: 日英の言語リンク位置を統一。英語 doc は対になる `*.ja.md` のみリンク。未公開の Pro CLI 記述を OSS ドキュメントから削除
- Git フック: Lefthook（`lefthook.yml`、`deno task setup:hooks`）

## [1.0.5] - 2026-05-22

### 追加

- 6 パッケージすべてに `README.md` / `README.ja.md`（npm には英語 README）
- npm の `keywords` / `homepage` / `bugs` を dnt ビルドで付与（`scripts/dnt/package-metadata.ts`、`deno task check:npm-readme`）
- ランタイム互換スモーク: `compat/node` / `compat/bun` / `compat/workers`（`deno task test:compat`）

### 変更

- `@wyrly/core` README: Deno（JSR）のインストールとランタイム表を前面に
- npm ビルドから `@deno/shim-deno` を除去、`i18n` の環境変数参照をポータブル化

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

[2.1.0]: https://github.com/valid-lab/wyrly/releases/tag/v2.1.0
[2.0.0]: https://github.com/valid-lab/wyrly/releases/tag/v2.0.0
[1.0.6]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.6
[1.0.5]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.5
[1.0.4]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.4
[1.0.3]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.3
[1.0.2]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.2
[1.0.1]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.1
[1.0.0]: https://github.com/valid-lab/wyrly/releases/tag/v1.0.0
