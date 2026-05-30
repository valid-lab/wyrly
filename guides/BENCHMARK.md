# DI performance benchmarks

Wyrly DI ships a **local-only** benchmark suite under [`benchmarks/di/`](../benchmarks/di/) that
compares resolve performance against vanilla wiring, typed-inject, tsyringe, InversifyJS, and NestJS
DI.

These benchmarks are **not** part of CI. Numbers vary by machine and Node.js version.

## Quick start

```sh
cd wyrly/oss
deno task build:npm:core   # first time only
deno task bench:di
```

See [`benchmarks/di/README.md`](../benchmarks/di/README.md) for flags and output format.

## What is measured

Four suites, all using the same ten-node dependency graph (one root resolve walks nine
dependencies):

| Suite                   | Meaning                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `resolution`            | Hot-path resolve with container already bootstrapped                    |
| `cold_start`            | Bootstrap only (new container / Nest application context per iteration) |
| `cold_start_resolution` | Bootstrap + one full resolve + teardown                                 |
| `request_scope`         | One simulated HTTP request (scope create → resolve → dispose)           |

## Dependency graph

```txt
RootService
  ├── ServiceA → StoreA → ClientA
  ├── ServiceB → StoreB → ClientB
  └── ServiceC → StoreC → ClientC
```

Singleton lifetimes are used in `resolution` and `cold_start*` suites. Scoped / request variants are
used in `request_scope`.

## Interpreting results

### Resolution (most relevant for web apps)

Typical TypeScript runtime DI containers resolve in the **~1–6M ops/sec** range on modern hardware
when measuring pure container lookup and construction. Manual wiring and compile-time approaches can
be orders of magnitude faster in microbenchmarks because they reduce to field access.

Wyrly DI avoids `reflect-metadata` and runtime constructor introspection, so it is expected to sit
in the **lighter runtime container** group alongside typed-inject, often ahead of metadata-heavy
tsyringe / Inversify setups.

For cached singleton resolves with no scope-local bindings, Wyrly skips provider lookup via an
ultra-fast cache path (the hot path for `container.resolve()`). Some gap vs typed-inject remains
due to Wyrly’s per-resolve token-type safety checks; in real web apps (a few resolves per request)
this is still **microseconds**.

### Cold start

NestJS measures `NestFactory.createApplicationContext`, which includes **module compilation,
provider scanning, and framework initialization** — not just DI lookup. Expect NestJS to be **much
slower** than bare containers here. That does not mean NestJS apps are unusably slow; it reflects
what is included in the measurement.

The **production Web / Workers pattern** for Wyrly DI is a **single** composition root registered at
module scope (see [`compat/workers/src/index.ts`](../compat/workers/src/index.ts)). The `cold_start`
bench repeats `createContainer()` plus all `register()` calls every iteration — a **synthetic
worst-case**. It reflects isolate cold boot (module eval + register) more than steady-state request
handling; for the latter, prefer `request_scope` (Group B).

`cold_start_resolution` also resolves the full graph once per iteration, so lazy dep-key compilation
shifts work from register to the first resolve. Expect a smaller gap vs tsyringe than in
register-only `cold_start`.

### Request scope

Wyrly registers the composition root once in `beforeAll`; the timed loop only runs
`container.createScope()` → `resolve` → `scope.disposeSync()` (closer to one production HTTP request).
typed-inject has no scoped lifetime API, so it builds the injector in `beforeAll` and uses
`createChildInjector()` per iteration as a one-request boundary approximation. tsyringe cannot
combine factory providers with `ContainerScoped`, so it uses **one child container per request**
(fresh singleton cache cleared via `clearInstances()`). NestJS simulates `Scope.REQUEST` with
`ContextIdFactory.create()` but may recreate the application context, so treat its numbers as
indicative only. Absolute overhead per real HTTP request is usually **microseconds**, dwarfed by I/O.

#### Comparison groups (interpretation)

| Group | Suite / adapters | What is measured |
| ----- | ---------------- | ---------------- |
| **A: cached hot path** | `resolution` (all), `typed-inject` / `nestjs` `request_scope` | Cached resolve on a warm container |
| **B: scoped cold build** | **wyrly** / **inversify** / **tsyringe** `request_scope` | New graph built per simulated request |

Do not compare Group A and Group B ops/s directly.

### Do not over-interpret

- A web handler typically resolves **a handful** of services per request, not millions.
- Database queries, external APIs, and serialization dominate latency in production.
- Use these numbers to understand **relative container cost**, not to predict end-user latency.

## Reference

The graph shape and suite names follow the approach described in
[DI Benchmark on DEV](https://dev.to/vad3x/di-benchmark-vanilla-registrycomposer-typed-inject-tsyringe-inversify-nestjs-2e4c),
extended with Wyrly DI and a dedicated `request_scope` suite.

## See also

- [Compare Wyrly DI](./COMPARE.md)
- [benchmarks/di/README.md](../benchmarks/di/README.md)
