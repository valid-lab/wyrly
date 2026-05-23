# Wyrly DI

[![CI](https://github.com/valid-lab/wyrly/actions/workflows/ci.yml/badge.svg)](https://github.com/valid-lab/wyrly/actions/workflows/ci.yml)
[![JSR @wyrly/core](https://jsr.io/badges/@wyrly/core)](https://jsr.io/@wyrly/core)
[![npm @wyrly/core](https://img.shields.io/npm/v/@wyrly/core)](https://www.npmjs.com/package/@wyrly/core)
[![License](https://img.shields.io/github/license/valid-lab/wyrly)](https://github.com/valid-lab/wyrly/blob/main/LICENSE)

> Type-safe dependency injection for modern TypeScript. No `reflect-metadata`. Standard decorators.
> Request scopes for web apps.

Japanese: [README.ja.md](./README.ja.md)

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md) · Security: [SECURITY.md](SECURITY.md)

Wyrly DI is a dependency injection toolkit for explicit, analyzable, type-safe application
architecture.

Use it when you want DI for modern TypeScript apps without legacy decorator metadata, automatic
runtime type guessing, or framework lock-in. It is built around typed tokens, explicit dependencies,
request scopes, DDD / Clean Architecture, and thin adapters for web frameworks.

## Start here

Choose your runtime:

| Runtime     | Install                    | Package page                                                   |
| ----------- | -------------------------- | -------------------------------------------------------------- |
| Deno 2.x    | `deno add jsr:@wyrly/core` | [JSR `@wyrly/core`](https://jsr.io/@wyrly/core)                |
| Node.js 20+ | `npm install @wyrly/core`  | [npm `@wyrly/core`](https://www.npmjs.com/package/@wyrly/core) |
| Bun         | `bun add @wyrly/core`      | [npm `@wyrly/core`](https://www.npmjs.com/package/@wyrly/core) |

Choose your framework:

| If you use...             | Start with                                                  | What it proves                                                                    |
| ------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Next.js App Router        | [`examples/next-ddd`](./examples/next-ddd/)                 | Route Handlers, Server Actions, and Server Components can share request-scoped DI |
| Hono / Cloudflare Workers | [`examples/hono-api`](./examples/hono-api/)                 | Edge-friendly middleware can create one DI scope per request                      |
| GraphQL / DataLoader      | [`examples/graphql-request`](./examples/graphql-request/)   | One GraphQL request can own scoped loaders and dispose them cleanly               |
| DDD / Clean Architecture  | [`examples/basic-ddd`](./examples/basic-ddd/)               | Ports, use cases, and infrastructure can be wired explicitly                      |
| CI validation             | [`examples/dependency-graph`](./examples/dependency-graph/) | `inspect()` / `validate()` can catch graph and lifetime issues                    |

Comparing options? See [guides/COMPARE.md](./guides/COMPARE.md),
[guides/MIGRATING_FROM_TSYRINGE.md](./guides/MIGRATING_FROM_TSYRINGE.md), and
[guides/MIGRATING_FROM_INVERSIFY.md](./guides/MIGRATING_FROM_INVERSIFY.md).

## Concept

```txt
Wyrly DI
for explicit, analyzable, type-safe application architecture.
```

## Why

Many TypeScript DI libraries were designed around legacy decorators, `reflect-metadata`, and
`emitDecoratorMetadata`.

Wyrly DI takes a different approach.

```txt
No reflect-metadata.
No legacy decorators.
No parameter decorators.
No runtime type guessing.
Explicit dependencies.
Type-safe tokens.
Request scopes.
Lifetime validation.
Inspectable dependency graph.
```

## Goals

- Work with TypeScript standard decorators
- Avoid `reflect-metadata`
- Avoid `emitDecoratorMetadata`
- Avoid parameter decorators
- Provide typed tokens
- Support constructor injection with explicit dependencies
- Support singleton / scoped / transient lifetimes
- Support request scope for web apps
- Provide adapters for Next.js, Express, Hono, Fresh, and GraphQL
- Support DDD / Clean Architecture
- Provide inspectable dependency graph for CLI / CI / AI tools

## Non-goals

Wyrly DI does not try to be a NestJS clone.

It intentionally avoids:

- automatic constructor type metadata
- runtime type guessing
- global container magic
- auto scan / glob registration
- framework coupling in the core package
- client-side React DI as a primary use case

## Packages

```txt
@wyrly/core
@wyrly/next
@wyrly/express
@wyrly/hono
@wyrly/fresh
@wyrly/graphql
```

See [API.md](./API.md) for the frozen **v1.0** public export surface.

## Installation

**v1.0.0** — install from **JSR** or **npm**, or clone this repo for workspace development. See
[PUBLISHING.md](./PUBLISHING.md) for release details.

### JSR (Deno)

```jsonc
// deno.json
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^1.0.0"
  }
}
```

```ts
import { createContainer, token } from "@wyrly/core";
```

Add adapters as needed (for example `jsr:@wyrly/next@^1.0.0`).

### npm (Node / bundlers)

```sh
npm install @wyrly/core
```

```ts
import { createContainer, token } from "@wyrly/core";
```

Add adapters as needed (for example `npm install @wyrly/next`). **`@wyrly/fresh` is JSR-only**
(Fresh 2.x has no npm package). See [PUBLISHING.md](./PUBLISHING.md) for release steps (built with
[dnt](https://github.com/denoland/dnt)).

### Bun / Cloudflare Workers

All npm packages (`@wyrly/core`, adapters except `@wyrly/fresh`) are smoke-tested on **Node.js**
(`compat/node`) and **Bun** (`compat/bun`). **Cloudflare Workers** covers `@wyrly/core` and
`@wyrly/hono` (`compat/workers`).

### Workspace development (this repository)

```sh
git clone <your-fork-or-upstream-url>
cd wyrly/oss
deno task setup:hooks   # optional: Lefthook — pre-commit (fmt+lint), pre-push (fmt:check)
deno task check
deno task test
```

Import via workspace bare specifiers:

```ts
import { createContainer, token } from "@wyrly/core";
```

## Quick Example

```ts
import { createContainer, Injectable, token } from "@wyrly/core";

interface UserRepository {
  findById(id: string): Promise<User | null>;
}

const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(id: string) {
    return this.users.findById(id);
  }
}

class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // ...
    return null;
  }
}

const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
  lifetime: "scoped",
});

container.register(GetUserUseCase);

const scope = container.createScope();

try {
  const usecase = scope.resolve(GetUserUseCase);
  const user = await usecase.execute("user-1");
} finally {
  await scope.dispose();
}
```

## Typed Tokens

Interfaces disappear at runtime in TypeScript.\
Use typed tokens to safely inject interface-based dependencies.

```ts
export const UserRepositoryToken = token<UserRepository>("UserRepository");

const users = scope.resolve(UserRepositoryToken);
// users: UserRepository
```

## Standard Decorators

Use `@Injectable()` to attach dependency metadata.

```ts
@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

Decorators are optional.

```ts
container.register(GetUserUseCase, {
  useClass: GetUserUseCase,
  deps: [UserRepositoryToken],
  lifetime: "scoped",
});
```

## No Parameter Decorators

Wyrly DI does not support parameter decorators.

Not supported:

```ts
class GetUserUseCase {
  constructor(
    @Inject(UserRepositoryToken) private readonly users: UserRepository,
  ) {}
}
```

Use explicit `deps` instead:

```ts
@Injectable({
  deps: [UserRepositoryToken],
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

## Providers

### useClass

```ts
container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
});
```

### useValue

```ts
container.register(ConfigToken, {
  useValue: config,
});
```

### useFactory

```ts
container.register(DatabaseToken, {
  useFactory: (scope) => createDatabase(scope.resolve(ConfigToken)),
});
```

## Lifetimes

Supported lifetimes:

```ts
type Lifetime = "singleton" | "scoped" | "transient";
```

### singleton

One instance per root container.

```ts
container.register(LoggerToken, {
  useClass: ConsoleLogger,
  lifetime: "singleton",
});
```

### scoped

One instance per scope.

```ts
container.register(UnitOfWorkToken, {
  useClass: PrismaUnitOfWork,
  lifetime: "scoped",
});
```

### transient

New instance for every resolve.

```ts
container.register(TaskToken, {
  useClass: Task,
  lifetime: "transient",
});
```

## Request Scope

Web adapters create one scope per request.

```txt
1 HTTP request = 1 DI scope
1 GraphQL request = 1 DI scope
```

## Express Example

```ts
import express from "express";
import { asExpressRequestWithDI, diMiddleware } from "@wyrly/express";
import { appContainer } from "./di/container";

const app = express();

app.use(diMiddleware(appContainer));

app.get("/users/:id", async (req, res) => {
  const usecase = asExpressRequestWithDI(req).di.resolve(GetUserUseCase);
  const user = await usecase.execute(req.params.id);

  res.json(user);
});
```

## Hono Example

```ts
import { Hono } from "hono";
import { di, getDI, type HonoDIVariables } from "@wyrly/hono";
import { appContainer } from "./di/container";

const app = new Hono<{ Variables: HonoDIVariables }>();

app.use(di(appContainer));

app.get("/users/:id", async (c) => {
  const usecase = getDI(c).resolve(GetUserUseCase);

  return c.json(await usecase.execute(c.req.param("id")));
});
```

## Fresh Example

```ts
import { App } from "fresh";
import { di, type FreshDIState, withDI } from "@wyrly/fresh";
import { appContainer } from "./di/container";

const app = new App<FreshDIState>();

app.use(di(appContainer));

app.get("/users/:id", async (ctx) => {
  const usecase = ctx.state.di.resolve(GetUserUseCase);

  return Response.json(await usecase.execute(ctx.params.id));
});

export const GET = withDI(appContainer, async (ctx) => {
  const usecase = ctx.di.resolve(GetUserUseCase);
  const user = await usecase.execute(ctx.params.id);

  return Response.json(user);
});
```

## GraphQL Example

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";

const context = async ({ req, res }) =>
  createGraphQLDIContext(appContainer, {
    request: req,
    response: res,
  });

const resolvers = {
  Query: {
    user: async (_parent, args, ctx) => {
      const usecase = ctx.di.resolve(GetUserUseCase);
      return await usecase.execute(args.id);
    },
  },
};
```

## Next.js Route Handler Example

```ts
import { withDI } from "@wyrly/next";
import { appContainer } from "@/di/container";

export const GET = withDI(appContainer, async (req, { di, params }) => {
  const usecase = di.resolve(GetUserUseCase);
  const user = await usecase.execute(params.id);

  return Response.json(user);
});
```

For **Server Components** (`createServerDI`, `getDI()`, request scope via `cache()` and `after()`),
see [guides/SERVER_COMPONENTS.md](./guides/SERVER_COMPONENTS.md).

## DDD-friendly Structure

Recommended structure:

```txt
src/
  domain/
    models/
    repositories/
  application/
    usecases/
  infrastructure/
    repositories/
    database/
  presentation/
    http/
    graphql/
  composition/
    container.ts
```

Example composition root:

```ts
export function configureContainer(container: Container) {
  container.register(UserRepositoryToken, {
    useClass: PrismaUserRepository,
    lifetime: "scoped",
  });

  container.register(GetUserUseCase);
}
```

## Lifetime Validation

The container can detect dangerous lifetime relationships.

Example:

```ts
@Injectable({
  lifetime: "singleton",
  deps: [CurrentUserToken],
})
class AuditLogger {}
```

If `CurrentUserToken` is scoped, this should fail.

```txt
LifetimeViolationError:
Singleton AuditLogger cannot depend on scoped CurrentUser.
```

## Inspectable Dependency Graph

```ts
const graph = container.inspect();
```

Example graph:

```ts
{
  nodes: [
    {
      id: "GetUserUseCase",
      name: "GetUserUseCase",
      lifetime: "scoped",
      provider: "class"
    }
  ],
  edges: [
    {
      from: "GetUserUseCase",
      to: "UserRepository"
    }
  ]
}
```

This enables:

- dependency graph visualization
- CI validation
- architecture rule checks
- AI-assisted code understanding
- debugging

## Validation

Use the core API from your composition root or CI:

```ts
const { ok, issues } = container.validate({ locale: "en" });
```

Run the dependency-graph example (includes inspect + validate output):

```sh
deno task validate:example
# or: deno task example:dependency-graph
```

Graph export helpers live in `@wyrly/core` (`graphToJson`, `graphToDot`, `graphToMermaid`).

## TypeScript Configuration

Recommended:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "emitDecoratorMetadata": false
  }
}
```

## Design Principles

```txt
Explicit over magic.
Inspectable over hidden.
Standard decorators over legacy decorators.
Typed tokens over string tokens.
Composition root over auto scan.
Adapters over framework coupling.
```

## API stability

From **1.0.0**, public APIs are listed in [API.md](./API.md) and follow
[Semantic Versioning](https://semver.org/). Release notes: [CHANGELOG.md](./CHANGELOG.md).

## Roadmap

### v0.1–v0.5

Delivered in **1.0.0**: core, adapters, inspect/validate, examples, and CI in this repository.

### v1.0 (released)

- Stable public API ([API.md](./API.md))
- Production-oriented docs and [CHANGELOG.md](./CHANGELOG.md)
- Runnable template-style examples under `examples/`

## License

Core, adapters, and examples in this repository are licensed under the
[Apache License 2.0](LICENSE).

## Developing with Deno

This repo is a **Deno workspace** (see [`deno.jsonc`](./deno.jsonc)). Library packages live under
`packages/*` and are imported as bare specifiers like `@wyrly/core`.

Requirements:

- **Deno 2.x** (validated with Deno 2.7+)

Common commands:

```sh
deno task check      # type-check packages/ and examples/
deno task fmt        # format packages/ + examples/ + deno.jsonc
deno task fmt:check
deno task lint
deno task test
deno task examples   # run all core examples (see examples/README.md)
```

Example scenarios (framework-free):

```sh
deno task example:basic-ddd
deno task example:explicit-deps
deno task example:provider-patterns
deno task example:dependency-graph
```

When you add JSR or `npm:` dependencies, commit the generated **`deno.lock`** for reproducible
installs. If you rely heavily on npm packages, consider configuring `nodeModulesDir` in `deno.jsonc`
per the [Deno docs](https://docs.deno.com/).

## Status

**v1.0.0** — `@wyrly/core` and adapters are stable for the surface documented in [API.md](./API.md).
Report issues via your project’s issue tracker.

Contributors: see [AGENT.md](./AGENT.md).
