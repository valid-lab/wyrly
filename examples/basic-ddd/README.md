# basic-ddd

Minimal DDD-style composition root with request scope (`createScope` / `dispose`).

Japanese: [README.ja.md](./README.ja.md)

## What you learn

- Typed `token` and port interfaces
- Standard `@Injectable` with explicit `deps`
- `scoped` lifetime and `dispose`

## What this example proves

- Wyrly DI can wire a DDD-style use case without `reflect-metadata` or parameter decorators.
- Interface-based ports remain type-safe through `token<T>()`.
- A request-like scope can own scoped services and be disposed explicitly.

## Run

```sh
deno task example:basic-ddd
```

## Next steps

| Topic              | Example                                    |
| ------------------ | ------------------------------------------ |
| Provider variants  | [provider-patterns](../provider-patterns/) |
| Graph / validation | [dependency-graph](../dependency-graph/)   |
| HTTP adapter       | [hono-api](../hono-api/)                   |
