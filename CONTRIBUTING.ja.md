# Wyrly DI へのコントリビューション

English: [CONTRIBUTING.md](./CONTRIBUTING.md)

`@wyrly/*` へのコントリビューションに関心をお寄せいただきありがとうございます。

## 前提環境

- [Deno](https://deno.com/) **2.x**
- ローカルでフル CI を回す場合: **Node.js
  20+**、**npm**、[Bun](https://bun.sh/)（ランタイム互換スモークテスト用）

## 初回セットアップ

```sh
git clone https://github.com/valid-lab/wyrly.git
cd wyrly/oss
deno task setup:hooks   # 任意: Lefthook pre-commit / pre-push
```

## PR を出す前に

1. アーキテクチャとコーディング規約は [AGENT.md](./AGENT.md) を読んでください。
2. チェックを実行:

```sh
deno task ci:deno    # 高速: Deno ワークスペースのみ
deno task ci         # フルゲート（GitHub Actions と同等。Node + Bun が必要）
```

DI ベンチマーク:

```sh
deno task build:npm:core   # 初回のみ
deno task bench:di         # 全アダプタ比較（ローカル、~70s）
deno task bench:di:ci:full # CI 相当: Wyrly 4 スイート + baseline 比較
```

`packages/core/**` や `benchmarks/di/**` の変更時、CI は `deno task ci` とは別に `bench-regression` を実行します。ベースラインは `benchmarks/di/baselines/ci-wyrly.json`（**GHA ubuntu-latest 向け**。ローカル絶対値とは別）。意図的な性能改善後は `bench:di:ci` のあと `deno run -A scripts/ci/check-di-bench.ts --update-baseline` で JSON を更新してコミット。再実行で通るフレークは `minHz` を 1 回下げて対応。

**GHA のばらつき:** `bench-regression` は毎回 `BENCH_GHA_METRICS` の JSON 行と Step Summary 表を出力します（`deno task bench:di:report`）。PR なしで計測だけ溜める場合は [**DI bench (manual)**](.github/workflows/bench-di.yml) を `workflow_dispatch` 実行（`check_baseline` はオフのまま）。

詳細: [guides/BENCHMARK.ja.md](./guides/BENCHMARK.ja.md)

3. 利用者に見える変更では、[CHANGELOG.md](./CHANGELOG.md) と [CHANGELOG.ja.md](./CHANGELOG.ja.md) の
   `[Unreleased]` を更新してください。

## Pull request

- ベースブランチは `main`。
- 1 PR あたり 1 つの論理的な変更に絞ることを推奨します。
- [CI ワークフロー](.github/workflows/ci.yml) が通ること（ランナー上で `deno task ci`）。
- Conventional Commits（`feat:`、`fix:`、`docs:` など）は任意ですが推奨します。

## Dependabot

[`.github/dependabot.yml`](./.github/dependabot.yml) は **GitHub Actions** のみ更新します。`compat/`
の npm は gitignore された `packages/*/npm/` への `file:` 参照のため、Dependabot
のスキャン対象外です。

**Dependabot** ワークフローが `path_dependencies_not_reachable` でまだ失敗する場合は、リポジトリ
**Settings → Advanced Security** で **Dependabot security updates**
を無効化してください（**Dependabot alerts** は有効のまま）。`express` / `hono` などはアラートに従い
`compat/*/package.json` を手動更新します。

## リリース

リリースはメンテナが git タグ `vX.Y.Z` と [PUBLISHING.md](./PUBLISHING.md)（日本語:
[PUBLISHING.ja.md](./PUBLISHING.ja.md)）に従って行います。コントリビュータが JSR / npm
に直接公開する必要はありません。

## 質問・連絡

- 使い方・設計: [GitHub Discussions](https://github.com/valid-lab/wyrly/discussions) または Issues
- セキュリティ: [SECURITY.ja.md](./SECURITY.ja.md)（English: [SECURITY.md](./SECURITY.md)）

関連ドキュメント: [README.ja.md](./README.ja.md) · [PUBLISHING.ja.md](./PUBLISHING.ja.md)
