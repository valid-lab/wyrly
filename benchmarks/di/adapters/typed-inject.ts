import { createInjector, type Injector } from "typed-inject";
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
import { TOKENS } from "../graph/tokens.ts";
import type { BenchAdapter, BenchContext } from "./types.ts";

function assignInject<T>(
  ctor: new (...args: never[]) => T,
  inject: readonly string[],
): new (...args: never[]) => T {
  (ctor as unknown as { inject: readonly string[] }).inject = inject;
  return ctor;
}

assignInject(StoreA, [TOKENS.ClientA]);
assignInject(StoreB, [TOKENS.ClientB]);
assignInject(StoreC, [TOKENS.ClientC]);
assignInject(ServiceA, [TOKENS.StoreA]);
assignInject(ServiceB, [TOKENS.StoreB]);
assignInject(ServiceC, [TOKENS.StoreC]);
assignInject(RootService, [TOKENS.ServiceA, TOKENS.ServiceB, TOKENS.ServiceC]);

function buildInjector(): Injector<{ [TOKENS.RootService]: RootService }> {
  return createInjector()
    .provideClass(TOKENS.ClientA, ClientA)
    .provideClass(TOKENS.ClientB, ClientB)
    .provideClass(TOKENS.ClientC, ClientC)
    .provideClass(TOKENS.StoreA, StoreA)
    .provideClass(TOKENS.StoreB, StoreB)
    .provideClass(TOKENS.StoreC, StoreC)
    .provideClass(TOKENS.ServiceA, ServiceA)
    .provideClass(TOKENS.ServiceB, ServiceB)
    .provideClass(TOKENS.ServiceC, ServiceC)
    .provideClass(TOKENS.RootService, RootService);
}

export const typedInjectAdapter: BenchAdapter = {
  name: "typed-inject",

  create(): BenchContext {
    const injector = buildInjector();
    return {
      resolveRoot: () => injector.resolve(TOKENS.RootService).run(),
      dispose: () => {},
    };
  },

  createRequestScope(): BenchContext {
    const injector = buildInjector();
    const child = injector.createChildInjector();
    return {
      resolveRoot: () => child.resolve(TOKENS.RootService).run(),
      dispose: () => {},
    };
  },
};

export function createTypedInjectInjector(): Injector<{ [TOKENS.RootService]: RootService }> {
  return buildInjector();
}

export { TOKENS };
