# Examples

Wyrly DI の実行可能サンプルです。各フォルダは **1 シナリオ = 1 用途** です。

English: [README.md](./README.md)

## 学習順序（推奨）

1. Core（framework なし）
2. [dependency-graph](./dependency-graph/)（inspect / validate）
3. アダプター（お使いの framework）

## Core

| フォルダ                                  | 内容                                    | 実行                                  |
| ----------------------------------------- | --------------------------------------- | ------------------------------------- |
| [basic-ddd](./basic-ddd/)                 | token, `@Injectable`, scoped, `dispose` | `deno task example:basic-ddd`         |
| [explicit-deps](./explicit-deps/)         | デコレーターなし `register({ deps })`   | `deno task example:explicit-deps`     |
| [provider-patterns](./provider-patterns/) | `useValue`, `useFactory`, `useExisting` | `deno task example:provider-patterns` |
| [dependency-graph](./dependency-graph/)   | `inspect()`, `validate()`               | `deno task example:dependency-graph`  |

```sh
deno task examples:core
```

## Adapters（DDD 多ファイル）

| フォルダ                                            | パッケージ                               | 実行                                       |
| --------------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| [hono-api](./hono-api/)                             | `@wyrly/hono`                            | `deno task example:hono-api`               |
| [express-api](./express-api/)                       | `@wyrly/express`                         | `deno task example:express-api`            |
| [fastify-api](./fastify-api/)                       | `@wyrly/fastify`                         | `deno task example:fastify-api`            |
| [graphql-request](./graphql-request/)               | `@wyrly/graphql` + **scoped DataLoader** | `deno task example:graphql-request`        |
| [yoga-graphql](./yoga-graphql/)                     | GraphQL Yoga + dispose plugin            | `deno task example:yoga-graphql`           |
| [apollo-graphql](./apollo-graphql/)                 | Apollo Server 4 + dispose plugin         | `deno task example:apollo-graphql`         |
| [express-graphql](./express-graphql/)               | express + graphql                        | `deno task example:express-graphql`        |
| [apollo-express-graphql](./apollo-express-graphql/) | `@wyrly/express` + `@wyrly/apollo`       | `deno task example:apollo-express-graphql` |
| [fresh-routes](./fresh-routes/)                     | `@wyrly/fresh`                           | `deno task example:fresh-routes`           |
| [next-ddd](./next-ddd/)                             | `@wyrly/next`                            | `deno task example:next-ddd`               |

```sh
deno task examples:adapters
```

Express 系は `net` 権限が必要です。

## CI 向け validate（OSS）

```sh
deno task validate:example
```

## 一括実行

```sh
deno task examples
```

（core 4 件 + adapter 10 件）
