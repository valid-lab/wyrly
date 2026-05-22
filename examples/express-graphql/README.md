# express-graphql

One GraphQL request = one DI scope on Express (`@wyrly/express` + `@wyrly/graphql`).

`POST /graphql` is a stub that branches on `operation` in the JSON body (no full parser).

Japanese: [README.ja.md](./README.ja.md)

## Run

```sh
deno task example:express-graphql
```

## See also

- GraphQL only: [graphql-request](../graphql-request/) — scoped DataLoader (`UserLoader` in
  [`user_loader.ts`](../graphql-request/infrastructure/user_loader.ts))
