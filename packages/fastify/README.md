# @wyrly/fastify

Request-scoped dependency injection for Fastify 5 without `reflect-metadata` — use `diPlugin()` and
`getDI(request)` for one scope per HTTP request.

Japanese: [README.ja.md](./README.ja.md)

## Install

```sh
npm install @wyrly/fastify @wyrly/core fastify
```

Peer dependency: **fastify ^5.0.0**. The plugin uses **fastify-plugin** internally so hooks apply to
routes registered on the root instance.

## Quick start

```ts
import Fastify from "fastify";
import { diPlugin, getDI } from "@wyrly/fastify";
import { createContainer } from "@wyrly/core";

const container = createContainer();
const app = Fastify();

await app.register(diPlugin(container));

app.get("/users/:id", async (request) => {
  const di = getDI(request);
  // di.resolve(SomeUseCase)
  return { ok: true };
});
```

Scopes are disposed on response `finish` / `close` (same lifecycle as `@wyrly/express`). Map HTTP
data to port tokens in a `preHandler` (see
[examples/fastify-api](https://github.com/valid-lab/wyrly/tree/main/examples/fastify-api)).

## GraphQL on Fastify

For GraphQL on Fastify, combine with
[`@wyrly/apollo`](https://github.com/valid-lab/wyrly/tree/main/packages/apollo) or
[`@wyrly/yoga`](https://github.com/valid-lab/wyrly/tree/main/packages/yoga). Mount the GraphQL
handler on a Fastify route and use the GraphQL adapter for resolver scopes; keep `diPlugin` for REST
routes. See [yoga-graphql](https://github.com/valid-lab/wyrly/tree/main/examples/yoga-graphql) and
[apollo-express-graphql](https://github.com/valid-lab/wyrly/tree/main/examples/apollo-express-graphql).

## Documentation

- [Official docs](https://docs.wyrly.dev/?utm_source=github&utm_medium=package_readme&utm_campaign=launch&utm_content=fastify_en)
- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [express-api example](https://github.com/valid-lab/wyrly/tree/main/examples/express-api) (same DDD
  pattern)

## License

Apache-2.0 — [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE)
