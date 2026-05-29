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

function buildSingletonGraph(): RootService {
  const clientA = new ClientA();
  const clientB = new ClientB();
  const clientC = new ClientC();
  const storeA = new StoreA(clientA);
  const storeB = new StoreB(clientB);
  const storeC = new StoreC(clientC);
  const serviceA = new ServiceA(storeA);
  const serviceB = new ServiceB(storeB);
  const serviceC = new ServiceC(storeC);
  return new RootService(serviceA, serviceB, serviceC);
}

function createContext(root: RootService): BenchContext {
  return {
    resolveRoot: () => root.run(),
    dispose: () => {},
  };
}

export const vanillaAdapter: BenchAdapter = {
  name: "vanilla",

  create(): BenchContext {
    return createContext(buildSingletonGraph());
  },

  createRequestScope(): BenchContext {
    return createContext(buildSingletonGraph());
  },
};
