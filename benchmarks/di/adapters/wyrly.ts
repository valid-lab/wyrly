import { createContainer, token } from "@wyrly/core";
import type { Provider } from "@wyrly/core";
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

const ClientAToken = token<ClientA>("ClientA");
const ClientBToken = token<ClientB>("ClientB");
const ClientCToken = token<ClientC>("ClientC");
const StoreAToken = token<StoreA>("StoreA");
const StoreBToken = token<StoreB>("StoreB");
const StoreCToken = token<StoreC>("StoreC");
const ServiceAToken = token<ServiceA>("ServiceA");
const ServiceBToken = token<ServiceB>("ServiceB");
const ServiceCToken = token<ServiceC>("ServiceC");
const RootServiceToken = token<RootService>("RootService");

function graphEntries(
  lifetime: "singleton" | "scoped",
): readonly (readonly [unknown, Provider<unknown>])[] {
  return [
    [ClientAToken, { useClass: ClientA, deps: [], lifetime }],
    [ClientBToken, { useClass: ClientB, deps: [], lifetime }],
    [ClientCToken, { useClass: ClientC, deps: [], lifetime }],
    [StoreAToken, { useClass: StoreA, deps: [ClientAToken], lifetime }],
    [StoreBToken, { useClass: StoreB, deps: [ClientBToken], lifetime }],
    [StoreCToken, { useClass: StoreC, deps: [ClientCToken], lifetime }],
    [ServiceAToken, { useClass: ServiceA, deps: [StoreAToken], lifetime }],
    [ServiceBToken, { useClass: ServiceB, deps: [StoreBToken], lifetime }],
    [ServiceCToken, { useClass: ServiceC, deps: [StoreCToken], lifetime }],
    [RootServiceToken, {
      useClass: RootService,
      deps: [ServiceAToken, ServiceBToken, ServiceCToken],
      lifetime,
    }],
  ];
}

function registerGraph(
  container: ReturnType<typeof createContainer>,
  lifetime: "singleton" | "scoped",
): void {
  container.registerMany(graphEntries(lifetime));
}

export const wyrlyAdapter: BenchAdapter = {
  name: "wyrly",

  create(): BenchContext {
    const container = createContainer();
    registerGraph(container, "singleton");
    return {
      resolveRoot: () => container.resolve(RootServiceToken).run(),
      dispose: () => {},
    };
  },

  createRequestScope(): BenchContext {
    const container = createContainer();
    registerGraph(container, "scoped");
    const scope = container.createScope();
    return {
      resolveRoot: () => scope.resolve(RootServiceToken).run(),
      dispose: () => scope.dispose(),
    };
  },
};

/** Exported for cold-start benchmarks that rebuild the container each iteration. */
export function createWyrlySingletonContainer(): ReturnType<typeof createContainer> {
  const container = createContainer();
  registerGraph(container, "singleton");
  return container;
}

export function createWyrlyScopedContainer(): ReturnType<typeof createContainer> {
  const container = createContainer();
  registerGraph(container, "scoped");
  return container;
}

export function createWyrlyRequestScope(): {
  scope: ReturnType<ReturnType<typeof createContainer>["createScope"]>;
  container: ReturnType<typeof createContainer>;
} {
  const container = createContainer();
  registerGraph(container, "scoped");
  return { container, scope: container.createScope() };
}

export { RootServiceToken };
