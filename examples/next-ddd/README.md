# next-ddd

Three App Router patterns in DDD layout (no full Next app).

Japanese: [README.ja.md](./README.ja.md)

| File | API | In a real app |
| ---- | --- | ------------- |
| `presentation/route_handler.ts` | `withDI` | `app/api/users/[id]/route.ts` |
| `presentation/server_action.ts` | `withActionDI` | `app/actions/user.ts` |
| `presentation/server_component.ts` | `createServerDI` | `app/users/[id]/page.tsx` |

## Run

```sh
deno task example:next-ddd
```

## See also

- Core: [basic-ddd](../basic-ddd/)
