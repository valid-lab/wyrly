# next-ddd

Three App Router patterns in DDD layout (no full Next app).

Japanese: [README.ja.md](./README.ja.md)

| File                               | API              | In a real app                 |
| ---------------------------------- | ---------------- | ----------------------------- |
| `presentation/route_handler.ts`    | `withDI`         | `app/api/users/[id]/route.ts` |
| `presentation/server_action.ts`    | `withActionDI`   | `app/actions/user.ts`         |
| `presentation/server_component.ts` | `createServerDI` | `app/users/[id]/page.tsx`     |

## What this example proves

- Route Handlers, Server Actions, and Server Components can share the same explicit composition
  model.
- `@wyrly/next` can create request-scoped DI without relying on global mutable containers.
- DDD boundaries stay visible even when the presentation layer uses different App Router entry
  points.

## Run

```sh
deno task example:next-ddd
```

## Server Components guide

[guides/SERVER_COMPONENTS.md](../../guides/SERVER_COMPONENTS.md) — `cache()`, `after()`,
anti-patterns, and testing.

## See also

- Core: [basic-ddd](../basic-ddd/)
