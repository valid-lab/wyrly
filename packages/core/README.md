# @wyrly/core

Type-safe dependency injection for modern TypeScript. No `reflect-metadata`, no
`emitDecoratorMetadata`, no parameter decorators.

Use `@wyrly/core` when you want explicit dependencies, typed tokens, standard decorators, request
scopes, and inspectable dependency graphs without framework lock-in.

**Runtimes:** [Deno 2.x (JSR)](#install-deno--jsr) ·
[Node.js 20+ / Bun (npm)](#install-nodejs--bun--npm)

Japanese: [README.ja.md](./README.ja.md)

## When to choose Wyrly DI

- You want TypeScript DI that works with standard decorators instead of legacy decorator metadata.
- You want interface-based dependencies to stay type-safe through typed tokens.
- You need request scopes for Next.js, Hono, Express, Fresh, GraphQL, or another web runtime.
- You want to inspect and validate the dependency graph in CI.
- You prefer composition roots and explicit wiring for DDD / Clean Architecture.

## Runtimes

| Runtime      | Registry                                         | Import                   |
| ------------ | ------------------------------------------------ | ------------------------ |
| **Deno 2.x** | [JSR `@wyrly/core`](https://jsr.io/@wyrly/core)  | `jsr:@wyrly/core@^2.0.0` |
| Node.js 20+  | [npm](https://www.npmjs.com/package/@wyrly/core) | `@wyrly/core`            |
| Bun          | npm (same package)                               | `@wyrly/core`            |

Published to **JSR and npm** from the same source. Deno users should prefer JSR; Node/Bun users use
npm.

## Install (Deno / JSR)

```jsonc
// deno.json
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^2.0.0"
  }
}
```

```sh
# or add with Deno 2.x
deno add jsr:@wyrly/core
```

```ts
import { createContainer, Injectable, token } from "@wyrly/core";
```

See also on [jsr.io/@wyrly/core](https://jsr.io/@wyrly/core).

## Install (Node.js / Bun / npm)

```sh
npm install @wyrly/core
# bun add @wyrly/core
```

```ts
import { createContainer, Injectable, token } from "@wyrly/core";
```

## Requirements

- **TypeScript 5+** with
  [standard (TC39) decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)
  (`experimentalDecorators: false`)
- **ESM** (`"type": "module"` recommended on Node/Bun)
- **Deno 2.x**, **Node.js 20+**, **Bun**, or bundlers that support the above

No `reflect-metadata`, no `emitDecoratorMetadata`, no parameter decorators.

## Quick start

```ts
import { createContainer, Injectable, token } from "@wyrly/core";

const RepoToken = token<{ findById(id: string): Promise<unknown> }>("Repo");

@Injectable({ deps: [RepoToken], lifetime: "scoped" })
class GetUser {
  constructor(private readonly repo: { findById(id: string): Promise<unknown> }) {}
}

const container = createContainer();
container.register(RepoToken, {
  useValue: { findById: async () => null },
  lifetime: "scoped",
});
container.register(GetUser);

const scope = container.createScope();
try {
  scope.resolve(GetUser);
} finally {
  await scope.dispose();
}
```

## Documentation

- [API reference](https://github.com/valid-lab/wyrly/blob/main/API.md)
- [Monorepo README](https://github.com/valid-lab/wyrly/blob/main/README.md)
- [Comparison guide](https://github.com/valid-lab/wyrly/blob/main/guides/COMPARE.md)
- [Examples](https://github.com/valid-lab/wyrly/blob/main/examples/README.md)
- [Publishing & runtimes](https://github.com/valid-lab/wyrly/blob/main/PUBLISHING.md)

## Related packages

| Package          | Deno (JSR) | npm | Description                       |
| ---------------- | ---------- | --- | --------------------------------- |
| `@wyrly/core`    | yes        | yes | Core container, tokens, lifetimes |
| `@wyrly/express` | yes        | yes | Express 5 middleware              |
| `@wyrly/hono`    | yes        | yes | Hono middleware                   |
| `@wyrly/graphql` | yes        | yes | GraphQL request scope             |
| `@wyrly/next`    | yes        | yes | Next.js App Router                |
| `@wyrly/fresh`   | yes        | —   | Fresh 2.x (JSR only)              |

## License

Apache-2.0 — see [LICENSE](https://github.com/valid-lab/wyrly/blob/main/LICENSE).
