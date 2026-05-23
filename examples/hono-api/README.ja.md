# hono-api

`@wyrly/hono` でリクエストスコープ DI + DDD レイヤー分離の例です。

English: [README.md](./README.md)

## 構成

| レイヤー         | ファイル                                | 役割                                      |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| domain           | `domain/user.ts`                        | エンティティ・port token                  |
| application      | `application/get_user.ts`               | `GetUserUseCase`                          |
| infrastructure   | `infrastructure/in_memory_user_repo.ts` | Repository 実装                           |
| presentation     | `presentation/routes.ts`                | `di()` + `X-User-Id` → `CurrentUserToken` |
| composition root | `main.ts`                               | `export const container`                  |

## この example で確認できること

- `@wyrly/hono` で Hono アプリのリクエストごとに 1 つの DI scope を作れる。
- `X-User-Id` のようなリクエスト由来の値を scoped dependency として扱える。
- 同じ DDD composition root を Node.js、Bun、Cloudflare Workers 寄りの Hono 配置に持ち込める。

## 実行

```sh
deno task example:hono-api
```

`app.request()` でデモするためネットワーク権限は不要です。実サーバで試す場合:

```sh
cd examples/hono-api && deno run -A --unstable-net main_serve.ts  # 任意
```

## 関連

- Core: [basic-ddd](../basic-ddd/)
- GraphQL: [graphql-request](../graphql-request/)
