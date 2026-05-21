# graphql-request

`createGraphQLDIContext` and a scoped DataLoader-style factory (no GraphQL server).

Japanese: [README.ja.md](./README.ja.md)

## Layout

| Layer | Role |
| ----- | ---- |
| domain | Types and port tokens |
| application | Batch user fetch use case |
| infrastructure | Scoped `UserLoader` factory |
| presentation | Pseudo-resolvers + `ctx.dispose()` |

## Run

```sh
deno task example:graphql-request
```

## See also

- Combined: [express-graphql](../express-graphql/)
- Core: [provider-patterns](../provider-patterns/)
