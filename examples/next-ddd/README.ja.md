# next-ddd

`@wyrly/next` の 3 パターンを DDD 構成で示す例です（フル Next アプリは含みません）。

| ファイル                           | API              | 実プロジェクトでの配置例      |
| ---------------------------------- | ---------------- | ----------------------------- |
| `presentation/route_handler.ts`    | `withDI`         | `app/api/users/[id]/route.ts` |
| `presentation/server_action.ts`    | `withActionDI`   | `app/actions/user.ts`         |
| `presentation/server_component.ts` | `createServerDI` | `app/users/[id]/page.tsx`     |

## 実行

```sh
deno task example:next-ddd
```

## Server Components ガイド

[guides/SERVER_COMPONENTS.ja.md](../../guides/SERVER_COMPONENTS.ja.md) — `cache()` /
`after()`、アンチパターン、テスト。

## 関連

- Core: [basic-ddd](../basic-ddd/)
