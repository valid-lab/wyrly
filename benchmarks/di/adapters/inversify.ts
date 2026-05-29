import "reflect-metadata";
import { Container } from "inversify";
import {
  ClientA,
  ClientB,
  ClientC,
  RootService,
  ServiceA,
  ServiceB,
  ServiceC,
  StoreA,
  StoreB,
  StoreC,
} from "../graph/services.ts";
import type { BenchAdapter, BenchContext } from "./types.ts";

function bindSingletonGraph(container: Container): void {
  container.bind(ClientA).toSelf().inSingletonScope();
  container.bind(ClientB).toSelf().inSingletonScope();
  container.bind(ClientC).toSelf().inSingletonScope();
  container.bind(StoreA).toDynamicValue((ctx) => new StoreA(ctx.container.get(ClientA)))
    .inSingletonScope();
  container.bind(StoreB).toDynamicValue((ctx) => new StoreB(ctx.container.get(ClientB)))
    .inSingletonScope();
  container.bind(StoreC).toDynamicValue((ctx) => new StoreC(ctx.container.get(ClientC)))
    .inSingletonScope();
  container.bind(ServiceA).toDynamicValue((ctx) => new ServiceA(ctx.container.get(StoreA)))
    .inSingletonScope();
  container.bind(ServiceB).toDynamicValue((ctx) => new ServiceB(ctx.container.get(StoreB)))
    .inSingletonScope();
  container.bind(ServiceC).toDynamicValue((ctx) => new ServiceC(ctx.container.get(StoreC)))
    .inSingletonScope();
  container.bind(RootService).toDynamicValue((ctx) =>
    new RootService(
      ctx.container.get(ServiceA),
      ctx.container.get(ServiceB),
      ctx.container.get(ServiceC),
    )
  ).inSingletonScope();
}

function bindRequestScopedGraph(container: Container): void {
  container.bind(ClientA).toSelf().inRequestScope();
  container.bind(ClientB).toSelf().inRequestScope();
  container.bind(ClientC).toSelf().inRequestScope();
  container.bind(StoreA).toDynamicValue((ctx) => new StoreA(ctx.container.get(ClientA)))
    .inRequestScope();
  container.bind(StoreB).toDynamicValue((ctx) => new StoreB(ctx.container.get(ClientB)))
    .inRequestScope();
  container.bind(StoreC).toDynamicValue((ctx) => new StoreC(ctx.container.get(ClientC)))
    .inRequestScope();
  container.bind(ServiceA).toDynamicValue((ctx) => new ServiceA(ctx.container.get(StoreA)))
    .inRequestScope();
  container.bind(ServiceB).toDynamicValue((ctx) => new ServiceB(ctx.container.get(StoreB)))
    .inRequestScope();
  container.bind(ServiceC).toDynamicValue((ctx) => new ServiceC(ctx.container.get(StoreC)))
    .inRequestScope();
  container.bind(RootService).toDynamicValue((ctx) =>
    new RootService(
      ctx.container.get(ServiceA),
      ctx.container.get(ServiceB),
      ctx.container.get(ServiceC),
    )
  ).inRequestScope();
}

export function createInversifySingletonContainer(): Container {
  const container = new Container({ defaultScope: "Singleton" });
  bindSingletonGraph(container);
  return container;
}

export function createInversifyRequestScopeContainer(): Container {
  const container = new Container({ defaultScope: "Request" });
  bindRequestScopedGraph(container);
  return container;
}

export const inversifyAdapter: BenchAdapter = {
  name: "inversify",

  create(): BenchContext {
    const container = createInversifySingletonContainer();
    return {
      resolveRoot: () => container.get(RootService).run(),
      dispose: () => {},
    };
  },

  createRequestScope(): BenchContext {
    const container = createInversifyRequestScopeContainer();
    return {
      resolveRoot: () => container.get(RootService).run(),
      dispose: () => {},
    };
  },
};

export { RootService };
