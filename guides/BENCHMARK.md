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

Since Phase 5C, an all-singleton composition root uses a **frozen singleton graph** (topological
one-shot materialize plus batched dep-key compile before the first resolve), similar to the frozen
scoped path for `request_scope`.

Phase 6 (Bootstrap Compiler) **eager-finalizes dep slot indices** at the end of `registerMany`;
**frozen singleton/scoped plans are built lazily** on the first `resolve` or `createScope`.
Materialize uses `depSlotIndices` and dense `singletonBySlot` array lookups. Prefer
**`registerMany` in topological order** for composition roots; incremental `register` / `override`
still invalidates and rebuilds lazily. The Wyrly adapter (symbol tokens + explicit deps) can still
rank below inversify class-as-token registration on `cold_start`; production apps register once at
module scope.

### Request scope

**Group B** (wyrly / tsyringe / inversify) each build the composition root once in `beforeAll`; the
timed loop measures **one request boundary only**:

| Adapter | One request boundary |
| ------- | -------------------- |
| **wyrly** | `createScope()` → resolve (all providers `scoped`) → `disposeSync()` |
| **inversify** | `get(RootService)` on a pre-built Request-scoped container |
| **tsyringe** | **Register the full graph on a child container each iteration**, then resolve (no parent cache reuse) |

typed-inject has no scoped lifetime API (**Group A**): injector in `beforeAll`, loop uses
`createChildInjector()` + resolve only.

After `npm run bench`, a **Group B summary** table is printed for cross-adapter comparison.

#### Comparison groups (interpretation)

| Group | Suite / adapters | What is measured |
| ----- | ---------------- | ---------------- |
| **A: cached hot path** | `resolution` (all), `typed-inject` / `nestjs` `request_scope` | Cached resolve on a warm container |
| **B: request boundary** | **wyrly** / **inversify** / **tsyringe** `request_scope` | Pre-registered root + per-request instance construction |

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
