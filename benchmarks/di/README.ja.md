# DI ベンチマーク

Wyrly DI と他の TypeScript DI 手法（NestJS 含む）をローカルで比較する性能ベンチマークです。

**CI ゲートではありません。** 結果はマシン依存で、ローカルでの調査用です。

## 前提

- Node.js 20+
- npm
- ビルド済み `@wyrly/core` npm パッケージ:

```sh
cd wyrly/oss
deno task build:npm:core
```

## 実行

リポジトリルートから:

```sh
deno task bench:di
```

`deno task bench:di` は `node --import tsx run.ts` を直接実行します（`npm run bench` ではありません）。Deno 2.8+ で `benchmarks/di/package.json` が workspace 外としてエラーになるのを避けるためです。

このディレクトリから:

```sh
npm install
npm run bench
npm run bench:json   # results/benchmark-results.json も出力
```

スイートや adapter を絞る:

```sh
npm run bench -- --suite resolution --adapter wyrly,nestjs
npm run bench -- --suite cold_start,request_scope --adapter wyrly,tsyringe,inversify,nestjs
```

## スイート

| スイート | 測定内容 |
|----------|----------|
| `resolution` | ホットパスの resolve のみ（コンテナは `beforeAll` で起動済み） |
| `cold_start` | イテレーションごとにコンテナ / Nest ApplicationContext を新規作成 |
| `cold_start_resolution` | 作成 + グラフ全体を 1 回 resolve + 破棄 |
| `request_scope` | **Group B**: 登録済み root + 1 リクエスト境界（Wyrly: `createScope`→resolve→`disposeSync`、Inversify: `get`、tsyringe: 子 container へ毎回 register→resolve） |

## 依存グラフ

10 ノード、深さ 3。`RootService` を 1 回 resolve すると 9 依存を辿ります:

```txt
RootService
  ├── ServiceA → StoreA → ClientA
  ├── ServiceB → StoreB → ClientB
  └── ServiceC → StoreC → ClientC
```

`resolution` / `cold_start*` では全 provider を singleton。`request_scope` では request 相当の scoped 版。

## Adapter

| Adapter | 備考 |
|---------|------|
| `vanilla` | 手書き配線 baseline |
| `wyrly` | `@wyrly/core` + 明示的 `deps` + 型付き token |
| `typed-inject` | 明示的 `inject` 配列 |
| `tsyringe` | `reflect-metadata` + factory 登録 |
| `inversify` | `reflect-metadata` + dynamic value binding |
| `nestjs` | `NestFactory.createApplicationContext` — フレームワーク bootstrap コストを含む |

## 結果の読み方

- **resolution** が定常状態の Web アプリ（1 リクエストあたり数回 resolve）に最も近い。
- **cold_start** はモジュール compile や metadata scan を反映。NestJS は bare DI コンテナではなくフルフレームワークのため、ここでは桁違いに遅く出やすい。
- DI resolve は通常 1 リクエストあたり μs 級。実アプリでは DB / ネットワーク I/O が支配的。

関連: [guides/BENCHMARK.ja.md](../../guides/BENCHMARK.ja.md) · [guides/COMPARE.ja.md](../../guides/COMPARE.ja.md)
