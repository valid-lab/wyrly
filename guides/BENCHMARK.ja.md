# DI 性能ベンチマーク

Wyrly DI には [`benchmarks/di/`](../benchmarks/di/) に
**ローカル専用**のベンチマークスイートがあり、vanilla
配線、typed-inject、tsyringe、InversifyJS、NestJS DI と resolve 性能を比較できます。

全アダプタ実行（`deno task bench:di`）はローカル専用です。数値はマシンと Node.js バージョンで変わります。

**CI 回帰ゲート（別ジョブ）:** `packages/core/**` などの変更時、GitHub Actions の `bench-regression` が
Wyrly のみ 4 スイート（`resolution`, `cold_start`, `cold_start_resolution`, `request_scope`）を計測し、
[`benchmarks/di/baselines/ci-wyrly.json`](../benchmarks/di/baselines/ci-wyrly.json) の `minHz` 未満なら失敗します（約 5% マージン込み）。`minHz` は **GitHub Actions `ubuntu-latest`（共有ランナー）** 向けに調整しており、ローカル PC や WSL の絶対値とは一致しません。ローカルで `bench:di:check` が落ちても CI が通ることはあります。`deno task ci` には含まれません。

```sh
deno task bench:di:ci:full   # CI と同じ: build → wyrly ベンチ → baseline 比較
```

意図的な性能改善後は ubuntu-latest（または CI ログ）で再計測し、ベースラインを更新:

```sh
deno task bench:di:ci
deno run -A scripts/ci/check-di-bench.ts --update-baseline
```

CI がフレークする場合はジョブを無効化せず、再実行で通るなら `minHz` を 1 回だけ下げます。詳細は [CONTRIBUTING.ja.md](../CONTRIBUTING.ja.md)。

**GHA の分散を溜める:** `bench-regression` はログに `BENCH_GHA_METRICS {...}`（検索用）と Step Summary の表を出します。[`.github/workflows/bench-di.yml`](../.github/workflows/bench-di.yml) を手動実行（`workflow_dispatch`）すると PR なしで追加サンプルを取れます。

## クイックスタート

```sh
cd wyrly/oss
deno task build:npm:core   # 初回のみ
deno task bench:di
```

フラグと出力形式は [`benchmarks/di/README.ja.md`](../benchmarks/di/README.ja.md)
を参照してください。

## 測定内容

4 スイート。いずれも同一の 10 ノード依存グラフ（root を 1 回 resolve すると 9 依存を辿る）:

| スイート                | 意味                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| `resolution`            | コンテナ起動済みのホットパス resolve                                         |
| `cold_start`            | bootstrap のみ（イテレーションごとに新規コンテナ / Nest ApplicationContext） |
| `cold_start_resolution` | bootstrap + 1 回 resolve + teardown                                          |
| `request_scope`         | 1 HTTP リクエスト相当（scope 作成 → resolve → dispose）                      |

## 依存グラフ

```txt
RootService
  ├── ServiceA → StoreA → ClientA
  ├── ServiceB → StoreB → ClientB
  └── ServiceC → StoreC → ClientC
```

`resolution` と `cold_start*` では singleton。`request_scope` では scoped / request 相当。

## 結果の読み方

### resolution（Web アプリで最も参考になる）

TypeScript の runtime DI コンテナは、純粋な lookup + 構築だけを測ると、モダンなハードウェアで
**おおよそ ~1–6M ops/sec** 程度が一般的です。手書き配線やコンパイル時 DI
は、マイクロベンチではフィールドアクセスに近づくため、桁違いに速く出ます。

Wyrly DI は `reflect-metadata` とコンストラクタの実行時 introspection を使わないため、typed-inject
と同様 **軽量 runtime コンテナ**のグループに入り、metadata 依存の tsyringe / Inversify
より有利に出ることが多いです。

キャッシュ済み singleton の resolve では、scope-local binding が無い場合に provider lookup
をスキップする ultra-fast path を通ります（`container.resolve()` の主要経路）。typed-inject
との差の一部は、Wyrly が毎 resolve で token 型 DI の安全チェックを行う設計差として残りますが、実 Web
アプリ（1 リクエストあたり数回の resolve）では μs 級です。

### cold_start

NestJS は `NestFactory.createApplicationContext` を測定しており、**モジュール compile、provider
scan、フレームワーク初期化**を含みます。bare コンテナより桁違いに遅く出るのが正常です。Nest
アプリ全体の起動時間とイコールではありません。

Wyrly DI の **本番 Web / Workers パターン**は module スコープで composition root を **1 回だけ**
登録します（[`compat/workers/src/index.ts`](../compat/workers/src/index.ts) 参照）。`cold_start`
ベンチはイテレーションごとに `createContainer()` + 全 `register()` を繰り返す **synthetic worst-case**
です。isolate 初回起動（module eval + register）の改善には効きますが、定常リクエスト処理の参考は
`request_scope`（Group B）の方が近いです。

`cold_start_resolution` は register に加え 1 回 resolve するため、dep key の lazy compile コストが
resolve 側に移ります。register のみの `cold_start` より tsyringe との差は小さく出やすいです。

Phase 5C 以降、全 provider が singleton の composition root では **frozen singleton graph**
（topo 順の一括 materialize + 初回 resolve 前の dep key 一括 compile）が有効です。`request_scope`
向けの frozen scoped graph と同型で、初回 `container.resolve()` の深さ優先再帰を避けます。

Phase 6（Bootstrap Compiler）で `depSlotIndices` と dense `ResolvePlan` を導入。**frozen plan は
初回 `resolve` / `createScope` で lazy 構築**します。

Phase 6.1（ハイブリッド）: **singleton** は `singletonCache` 直参照と frozen materialize 時の lazy
`depKeys`（5C 相当）。**scoped** frozen materialize は `depSlotIndices` のまま、`registerMany`
finalize は scoped グラフのみ `compileScopedDepSlotIndices`（singleton の dep index は lazy）。

**内部構成**（`@wyrly/core`、公開 API 外）: `container.ts` は `container_impl.ts`（scope +
container）を再エクスポート。frozen plan は `graph_topo.ts` を共有。bootstrap は
`bootstrap_state.ts`、動的 materialize は `instance_builder.ts`。ホットパスは
`container_impl.ts` にインラインのまま。

composition root は
**`registerMany` で topo 順に一括登録**するのが本番・ベンチともに最適です（単発 `register` は
従来どおり lazy 再構築）。symbol token + 明示 deps の Wyrly アダプタは、inversify の
class-as-token 登録より `cold_start` では不利に出ることがあります（本番は module スコープで 1 回 register）。

### request_scope

**Group B**（wyrly / tsyringe / inversify）はいずれも **composition root を `beforeAll` で 1 回構築**し、
ループ内は **1 リクエスト境界のみ**を計測します。

| Adapter | 1 リクエスト境界 |
| ------- | ---------------- |
| **wyrly** | `createScope()` → resolve（全ノード `scoped`）→ `disposeSync()` |
| **inversify** | 登録済み Request スコープ container で `get(RootService)` |
| **tsyringe** | 空の親の子 container に **毎回グラフを register** → resolve（親キャッシュなし） |

typed-inject は scoped lifetime が無いため **Group A**:
`beforeAll` で injector 構築済み、ループは `createChildInjector()` + resolve のみ。

`npm run bench` 実行後に **Group B summary** 表が出力されます（Group A と混在しないよう参照用）。

#### 比較グループ（解釈用）

| グループ | スイート / adapter | 測定の意味 |
| -------- | ------------------ | ---------- |
| **A: cached hot path** | `resolution` 全般、`typed-inject` / `nestjs` の `request_scope` | 起動済みコンテナ上のキャッシュ済み resolve |
| **B: request boundary** | **wyrly** / **inversify** / **tsyringe** の `request_scope` | 登録済み root + 1 リクエストあたりのインスタンス構築 |

Group A と Group B の ops/s を直接比較しないでください。NestJS は
`Scope.REQUEST` + `ContextIdFactory.create()` で 1 リクエストを模倣しますが、ApplicationContext
の再作成も含むため数値は参考程度にしてください。実 HTTP 1 件あたりの絶対コストは通常 **μs 級**で、I/O
に比べると無視できます。

### 過大解釈しない

- 1 ハンドラで resolve するのは通常 **数個**であり、数百万回ではない。
- 本番のレイテンシは DB / 外部 API / シリアライズが支配的。
- ここでの数値は **コンテナコストの相対比較**用であり、エンドユーザー体感速度の予測ではない。

## 参考

グラフ形状とスイート名は
[DI Benchmark (DEV)](https://dev.to/vad3x/di-benchmark-vanilla-registrycomposer-typed-inject-tsyringe-inversify-nestjs-2e4c)
を踏襲し、Wyrly DI と `request_scope` スイートを追加しています。

## 関連

- [Wyrly DI の比較](./COMPARE.ja.md)
- [benchmarks/di/README.ja.md](../benchmarks/di/README.ja.md)
