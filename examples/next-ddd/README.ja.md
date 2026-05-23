# next-ddd

`@wyrly/next` の 3 パターンを DDD 構成で示す例です（フル Next アプリは含みません）。

English: [README.md](./README.md)

| ファイル                           | API              | 実プロジェクトでの配置例      |
| ---------------------------------- | ---------------- | ----------------------------- |
| `presentation/route_handler.ts`    | `withDI`         | `app/api/users/[id]/route.ts` |
| `presentation/server_action.ts`    | `withActionDI`   | `app/actions/user.ts`         |
| `presentation/server_component.ts` | `createServerDI` | `app/users/[id]/page.tsx`     |

## この example で確認できること

- Route Handler、Server Action、Server Components が同じ明示的な composition model を共有できる。
- `@wyrly/next` でグローバルな可変コンテナに頼らず request-scoped DI を扱える。
- App Router の入口が分かれていても、DDD の境界を見える形で保てる。

## 実行

```sh
deno task example:next-ddd
```

## Server Components ガイド

[guides/SERVER_COMPONENTS.ja.md](../../guides/SERVER_COMPONENTS.ja.md) — `cache()` /
`after()`、アンチパターン、テスト。

## 関連

- Core: [basic-ddd](../basic-ddd/)
