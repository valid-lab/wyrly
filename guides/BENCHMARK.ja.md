# DI 性能ベンチマーク

Wyrly DI には [`benchmarks/di/`](../benchmarks/di/) に
**ローカル専用**のベンチマークスイートがあり、vanilla
配線、typed-inject、tsyringe、InversifyJS、NestJS DI と resolve 性能を比較できます。

CI には含まれません。数値はマシンと Node.js バージョンで変わります。

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

### request_scope

Wyrly は composition root を `beforeAll` で 1 回登録し、計測ループでは `container.createScope()` →
`resolve` → `scope.disposeSync()` のみ実行します（本番 Web アプリの 1 リクエストに近い）。typed-inject は
scoped lifetime API が無いため、`beforeAll` で injector を構築し、ループ内で `createChildInjector()` を
1 リクエスト境界として近似します。tsyringe は factory 登録のため `ContainerScoped`
を使えず、**子 container = 1 リクエスト**（子内 singleton キャッシュを毎回破棄）で近似します。

#### 比較グループ（解釈用）

| グループ | スイート / adapter | 測定の意味 |
| -------- | ------------------ | ---------- |
| **A: cached hot path** | `resolution` 全般、`typed-inject` / `nestjs` の `request_scope` | 起動済みコンテナ上のキャッシュ済み resolve |
| **B: scoped cold build** | **wyrly** / **inversify** / **tsyringe** の `request_scope` | 1 リクエストあたり scoped グラフを新規構築 |

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
