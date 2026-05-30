import "reflect-metadata";
import {
  container as globalContainer,
  type DependencyContainer,
} from "tsyringe";
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

function registerSingletonGraph(target: DependencyContainer): void {
  target.register(ClientA, { useClass: ClientA });
  target.register(ClientB, { useClass: ClientB });
  target.register(ClientC, { useClass: ClientC });
  target.register(StoreA, {
    useFactory: (c) => new StoreA(c.resolve(ClientA)),
  });
  target.register(StoreB, {
    useFactory: (c) => new StoreB(c.resolve(ClientB)),
  });
  target.register(StoreC, {
    useFactory: (c) => new StoreC(c.resolve(ClientC)),
  });
  target.register(ServiceA, {
    useFactory: (c) => new ServiceA(c.resolve(StoreA)),
  });
  target.register(ServiceB, {
    useFactory: (c) => new ServiceB(c.resolve(StoreB)),
  });
  target.register(ServiceC, {
    useFactory: (c) => new ServiceC(c.resolve(StoreC)),
  });
  target.register(RootService, {
    useFactory: (c) =>
      new RootService(
        c.resolve(ServiceA),
        c.resolve(ServiceB),
        c.resolve(ServiceC),
      ),
  });
}

export function createTsyringeSingletonContainer(): DependencyContainer {
  const c = globalContainer.createChildContainer();
  registerSingletonGraph(c);
  return c;
}

/** Empty parent for request_scope (registrations live on per-request child only). */
export function createTsyringeRequestScopeParent(): DependencyContainer {
  return globalContainer.createChildContainer();
}

/** One request boundary: register graph on child, resolve, discard (no parent cache reuse). */
export function resolveTsyringeRequestScope(parent: DependencyContainer): void {
  const request = parent.createChildContainer();
  registerSingletonGraph(request);
  request.resolve(RootService).run();
}

export const tsyringeAdapter: BenchAdapter = {
  name: "tsyringe",

  create(): BenchContext {
    const container = createTsyringeSingletonContainer();
    return {
      resolveRoot: () => container.resolve(RootService).run(),
      dispose: () => container.clearInstances(),
    };
  },

  createRequestScope(): BenchContext {
    const parent = createTsyringeRequestScopeParent();
    return {
      resolveRoot: () => resolveTsyringeRequestScope(parent),
      dispose: () => {},
    };
  },
};

export { RootService };
