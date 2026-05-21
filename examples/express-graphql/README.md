# express-graphql

One GraphQL request = one DI scope on Express (`@wyrly/express` + `@wyrly/graphql`).

Japanese: [README.ja.md](./README.ja.md)

`POST /graphql` is a stub that branches on `operation` in the JSON body (no full parser).

## Run

```sh
deno task example:express-graphql
```

## See also

- GraphQL only: [graphql-request](../graphql-request/)
