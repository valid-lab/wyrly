# DI benchmarks

Local performance comparison of Wyrly DI against other TypeScript DI approaches, including NestJS.

**Not a CI gate.** Results are machine-dependent and meant for local exploration.

## Prerequisites

- Node.js 20+
- npm
- Built `@wyrly/core` npm package:

```sh
cd wyrly/oss
deno task build:npm:core
```

## Run

From the repository root:

```sh
deno task bench:di
```

`deno task bench:di` runs `node --import tsx run.ts` (not `npm run bench`) so Deno 2.8+ does not treat `benchmarks/di/package.json` as a workspace member error.

Or from this directory:

```sh
npm install
npm run bench
npm run bench:json   # also writes results/benchmark-results.json
```

Filter suites or adapters:

```sh
npm run bench -- --suite resolution --adapter wyrly,nestjs
npm run bench -- --suite cold_start,request_scope --adapter wyrly,tsyringe,inversify,nestjs
```

## Suites

| Suite | What it measures |
|-------|------------------|
| `resolution` | Hot-path resolve only (container bootstrapped in `beforeAll`) |
| `cold_start` | Bootstrap container / Nest application context per iteration |
| `cold_start_resolution` | Bootstrap + one full graph resolve + teardown per iteration |
| `request_scope` | **Group B**: pre-registered root + one request boundary (Wyrly: `createScope`→resolve→`disposeSync`; Inversify: `get`; tsyringe: register graph on child container each iteration) |

## Dependency graph

Ten nodes, depth three. One `RootService` resolve walks nine dependencies:

```txt
RootService
  ├── ServiceA → StoreA → ClientA
  ├── ServiceB → StoreB → ClientB
  └── ServiceC → StoreC → ClientC
```

All singleton providers in `resolution` / `cold_start*` suites. Request-scoped variants in `request_scope`.

## Adapters

| Adapter | Notes |
|---------|-------|
| `vanilla` | Manual wiring baseline |
| `wyrly` | `@wyrly/core` with explicit `deps` and typed tokens |
| `typed-inject` | Explicit `inject` arrays |
| `tsyringe` | `reflect-metadata`, factory registration |
| `inversify` | `reflect-metadata`, dynamic value bindings |
| `nestjs` | `NestFactory.createApplicationContext` — includes framework bootstrap overhead |

## Interpreting results

- **Resolution** is the most relevant for steady-state web apps (a few resolves per request).
- **Cold start** shows module compilation and metadata scanning; NestJS is expected to be much slower here because it is a full framework, not a bare DI container.
- DI resolve time is usually microseconds per request. Database and network I/O dominate real applications.

See also [guides/BENCHMARK.md](../../guides/BENCHMARK.md) and [guides/COMPARE.md](../../guides/COMPARE.md).
