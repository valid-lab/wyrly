# basic-ddd

Minimal DDD-style composition root with request scope (`createScope` / `dispose`).

Japanese: [README.ja.md](./README.ja.md)

## What you learn

- Typed `token` and port interfaces
- Standard `@Injectable` with explicit `deps`
- `scoped` lifetime and `dispose`

## Run

```sh
deno task example:basic-ddd
```

## Next steps

| Topic | Example |
| ----- | ------- |
| Provider variants | [provider-patterns](../provider-patterns/) |
| Graph / validation | [dependency-graph](../dependency-graph/) |
| HTTP adapter | [hono-api](../hono-api/) |
