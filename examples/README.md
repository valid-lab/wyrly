# Examples

Runnable samples for Wyrly DI. Each folder is **one scenario = one use case**.

Japanese: [README.ja.md](./README.ja.md)

## Recommended learning order

1. Core (no framework)
2. [dependency-graph](./dependency-graph/) — inspect, validate (core API)
3. Adapters (your framework)

## Core

| Folder | Topic | Run |
| ------ | ----- | --- |
| [basic-ddd](./basic-ddd/) | token, `@Injectable`, scoped, `dispose` | `deno task example:basic-ddd` |
| [explicit-deps](./explicit-deps/) | explicit `register({ deps })` without decorators | `deno task example:explicit-deps` |
| [provider-patterns](./provider-patterns/) | `useValue`, `useFactory`, `useExisting` | `deno task example:provider-patterns` |
| [dependency-graph](./dependency-graph/) | `inspect()`, `validate()` | `deno task example:dependency-graph` |

```sh
deno task examples:core
```

## Adapters (multi-file DDD)

| Folder | Package | Run |
| ------ | ------- | --- |
| [hono-api](./hono-api/) | `@wyrly/hono` | `deno task example:hono-api` |
| [express-api](./express-api/) | `@wyrly/express` | `deno task example:express-api` |
| [graphql-request](./graphql-request/) | `@wyrly/graphql` | `deno task example:graphql-request` |
| [express-graphql](./express-graphql/) | express + graphql | `deno task example:express-graphql` |
| [fresh-routes](./fresh-routes/) | `@wyrly/fresh` | `deno task example:fresh-routes` |
| [next-ddd](./next-ddd/) | `@wyrly/next` | `deno task example:next-ddd` |

```sh
deno task examples:adapters
```

Express examples require `net` permission.

## Validation in CI (OSS)

```sh
deno task validate:example
```

Uses [`dependency-graph/main.ts`](./dependency-graph/main.ts) (`container.validate()`). For the **`wyrly` CLI**, use Wyrly Pro (private repo).

## Run all

```sh
deno task examples
```

(core 4 + adapters 6)
