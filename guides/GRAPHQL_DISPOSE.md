# GraphQL request scopes and disposal

Japanese: [GRAPHQL_DISPOSE.ja.md](./GRAPHQL_DISPOSE.ja.md)

This guide explains how to pair `@wyrly/graphql` with GraphQL servers so that **one GraphQL
request owns one DI scope**, and that scope is **always disposed** when the request ends.


## Rule

```txt
1 GraphQL request = 1 DI scope = 1 dispose()
```

Scoped providers (DataLoaders, request context, repositories opened per request) must not leak
across requests. Forgetting `dispose()` leaves disposers and scoped caches alive until GC — treat
that as a bug.


## Manual pattern (`createGraphQLDIContext`)

Use this with any server that can call a `context` function per request:

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";

const ctx = await createGraphQLDIContext(container, {
  request,
  response,
  configureScope(scope) {
    scope.set(CurrentUserToken, { id: userIdFrom(request) });
  },
});

try {
  const usecase = ctx.di.resolve(GetUserUseCase);
  return await usecase.execute(args.id);
} finally {
  await ctx.dispose();
}
```

Reference: [`packages/graphql/context.ts`](../packages/graphql/context.ts),
[`examples/graphql-request`](../examples/graphql-request/).


## GraphQL Yoga (`@wyrly/yoga`)

Use the official Envelop plugin and `yogaContext` (v2.2.0+):

```ts
import { GraphQLRequestToken, yogaContext, yogaDIPlugin } from "@wyrly/yoga";

createYoga({
  plugins: [
    yogaDIPlugin(container, {
      configureScope(scope) {
        const request = scope.resolve(GraphQLRequestToken);
        scope.set(CurrentUserToken, { id: userIdFrom(request) });
      },
      onDisposeError: (error, request) => console.error(error, request.url),
    }),
  ],
  context: yogaContext,
});
```

Resolvers use `ctx.wyrly.di.resolve(...)`. Disposal runs on `onResponse`.

See [`packages/yoga`](../packages/yoga/) and [`examples/yoga-graphql`](../examples/yoga-graphql/).

### Yoga (manual plugin)

If you cannot use `@wyrly/yoga`, attach disposal in a Yoga / Envelop plugin with
`createGraphQLDIContext` and a `WeakMap<Request, GraphQLDIContext>` (same lifecycle as above).


## Apollo Server 4+ (manual plugin)

Until a dedicated `@wyrly/apollo` package ships, dispose in `requestDidStart` → `willSendResponse`:

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";

const wyrlyPlugin = {
  async requestDidStart() {
    const ctx = await createGraphQLDIContext(container, { request, response });
    return {
      async willSendResponse() {
        await ctx.dispose();
      },
    };
  },
};
```

See [`examples/apollo-graphql`](../examples/apollo-graphql/).


## Composition root: map HTTP to port tokens

Do **not** inject `GraphQLRequestToken` into use cases. Map in `configureScope`:

```ts
configureScope(scope) {
  const userId = request.headers.get("x-user-id") ?? "anonymous";
  scope.set(CurrentUserToken, { id: UserId.from(userId) });
}
```

Same pattern as Express [`examples/express-api`](../examples/express-api/) (`mapCurrentUser`
middleware).


## DataLoader-style loaders

Register loaders as **scoped** factories; resolve from `ctx.di` in resolvers. One request reuses
one loader instance.

See [`examples/graphql-request/infrastructure/user_loader.ts`](../examples/graphql-request/infrastructure/user_loader.ts).


## Anti-patterns

| Anti-pattern | Why it hurts |
| ------------ | ------------ |
| Global `let currentScope` | Breaks request isolation; fails under concurrency |
| Never calling `dispose()` | Scoped disposers and caches leak |
| `GraphQLRequestToken` in domain layer | Couples business logic to GraphQL transport |
| Singleton depending on scoped (direct or transitive) | Fails at runtime or `validate()` — fix the graph |

Run `container.validate()` in CI. Use [`examples/dependency-graph`](../examples/dependency-graph/).


## Disposal errors (Express comparison)

`@wyrly/express` `diMiddleware` supports `onDisposeError` when disposal fails after the response
ends. GraphQL adapters should log or report the same class of failures in `willSendResponse` /
`onResponse` handlers.

Core v2.1+ supports `scope.dispose({ onError })` for framework-agnostic hooks.


## Related

- [examples/graphql-request](../examples/graphql-request/)
- [examples/express-graphql](../examples/express-graphql/)
- [guides/SERVER_COMPONENTS.md](./SERVER_COMPONENTS.md) (Next.js request scopes)
