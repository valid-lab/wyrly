# Compare Wyrly DI

Wyrly DI is for modern TypeScript teams that want explicit, analyzable dependency injection without
`reflect-metadata`, `emitDecoratorMetadata`, parameter decorators, or automatic runtime type
guessing.

It is not trying to be a full application framework. The core package stays small, and web
integration lives in adapters for Next.js, Hono, Express, Fresh, and GraphQL.

## Quick comparison

| Need                    | Wyrly DI                                        | Metadata-oriented DI                    | Typed Inject-style DI          |
| ----------------------- | ----------------------------------------------- | --------------------------------------- | ------------------------------ |
| Standard decorators     | First-class via `@Injectable({ deps })`         | Often legacy-decorator oriented         | Usually not decorator-centered |
| `reflect-metadata`      | Not required                                    | Often required                          | Not required                   |
| `emitDecoratorMetadata` | Not required                                    | Often required                          | Not required                   |
| Parameter decorators    | Not used                                        | Common                                  | Not used                       |
| Interface injection     | Typed `token<T>()`                              | Usually class/string/symbol tokens      | Usually string tokens          |
| Request scope           | Core concept plus official adapters             | Varies by library                       | Possible, but mostly generic   |
| DDD / composition root  | Explicit wiring is the default                  | Often mixed with auto scan / decorators | Explicit, but less web-focused |
| Graph inspection        | `inspect()`, `validate()`, graph export helpers | Varies                                  | Usually limited                |

## When Wyrly DI is a good fit

- You are building TypeScript web apps with Next.js App Router, Hono, Express, Fresh, GraphQL, Deno,
  Bun, Node.js, or Cloudflare Workers.
- You want DI without legacy decorator metadata.
- You prefer explicit composition roots over automatic class scanning.
- You use DDD / Clean Architecture and want dependencies to stay visible at module boundaries.
- You want to validate lifetimes and dependency graphs in CI.

## When another tool may be a better fit

- You want a full framework with modules, controllers, pipes, guards, and conventions bundled
  together.
- Your app already relies deeply on `reflect-metadata` and parameter decorators.
- You prefer automatic discovery / glob scanning over explicit registration.
- You need a mature plugin ecosystem more than a small, explicit core.

## Positioning

Wyrly DI sits between small explicit DI containers and heavier decorator-metadata frameworks:

```txt
Small explicit container  <  Wyrly DI  <  Full framework
Generic wiring            <  Web request scopes + DDD examples
Runtime metadata magic    <  Explicit deps + inspectable graph
```

## Adoption path

1. Start with [`@wyrly/core`](../packages/core/README.md) in one composition root.
2. Use typed tokens for interface-based dependencies.
3. Add the adapter for your web runtime.
4. Run an example close to your architecture:
   - [Next.js App Router](../examples/next-ddd/)
   - [Hono / Cloudflare Workers](../examples/hono-api/)
   - [GraphQL / DataLoader](../examples/graphql-request/)
   - [DDD composition root](../examples/basic-ddd/)
5. Use `container.validate()` in tests or CI once your graph has multiple lifetimes.

## See also

- [Migrate from tsyringe](./MIGRATING_FROM_TSYRINGE.md)
- [Migrate from InversifyJS](./MIGRATING_FROM_INVERSIFY.md)
- [Server Components guide](./SERVER_COMPONENTS.md)
