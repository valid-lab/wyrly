# provider-patterns

Three provider shapes in one composition root: `useValue`, `useFactory`, `useExisting`.

Japanese: [README.ja.md](./README.ja.md)

## What you learn

- `useValue` for constants / config
- Scoped `useFactory`
- `useExisting` alias registration

## Run

```sh
deno task example:provider-patterns
```

## Next step: request-scoped factories

After `useFactory` on the root container, learn **scoped** factories tied to a request scope
(GraphQL DataLoader pattern):

→ [graphql-request](../graphql-request/) — `lifetime: "scoped"` + `createGraphQLDIContext`

## See also

| Topic             | Example                                |
| ----------------- | -------------------------------------- |
| Scoped DataLoader | [graphql-request](../graphql-request/) |
| Express + GraphQL | [express-graphql](../express-graphql/) |
| Core intro        | [basic-ddd](../basic-ddd/)             |
