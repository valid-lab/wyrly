# Examples

English: [README.md](./README.md)

Wyrly DI の実行可能サンプルです。各フォルダは **1 シナリオ = 1 用途** です。

## 学習順序（推奨）

1. Core（framework なし）
2. [dependency-graph](./dependency-graph/)（inspect / validate）
3. アダプター（お使いの framework）

## Core

| フォルダ | 内容 | 実行 |
| -------- | ---- | ---- |
| [basic-ddd](./basic-ddd/) | token, `@Injectable`, scoped, `dispose` | `deno task example:basic-ddd` |
| [explicit-deps](./explicit-deps/) | デコレターなし `register({ deps })` | `deno task example:explicit-deps` |
| [provider-patterns](./provider-patterns/) | `useValue`, `useFactory`, `useExisting` | `deno task example:provider-patterns` |
| [dependency-graph](./dependency-graph/) | `inspect()`, `validate()` | `deno task example:dependency-graph` |

```sh
deno task examples:core
```

## Adapters（DDD 多ファイル）

| フォルダ | パッケージ | 実行 |
| -------- | ---------- | ---- |
| [hono-api](./hono-api/) | `@wyrly/hono` | `deno task example:hono-api` |
| [express-api](./express-api/) | `@wyrly/express` | `deno task example:express-api` |
| [graphql-request](./graphql-request/) | `@wyrly/graphql` | `deno task example:graphql-request` |
| [express-graphql](./express-graphql/) | express + graphql | `deno task example:express-graphql` |
| [fresh-routes](./fresh-routes/) | `@wyrly/fresh` | `deno task example:fresh-routes` |
| [next-ddd](./next-ddd/) | `@wyrly/next` | `deno task example:next-ddd` |

```sh
deno task examples:adapters
```

Express 系は `net` 権限が必要です。

## CI 向け validate（OSS）

```sh
deno task validate:example
```

`wyrly` CLI は **Wyrly Pro**（非公開）を利用してください。

## 一括実行

```sh
deno task examples
```

（core 4 件 + adapter 6 件）
