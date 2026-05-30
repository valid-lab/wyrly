import type { Task } from "tinybench";
import { ContextIdFactory } from "@nestjs/core";
import { createInversifyRequestScopeContainer, createInversifySingletonContainer } from "../adapters/inversify.ts";
import { RootService as InversifyRootService } from "../adapters/inversify.ts";
import {
  createNestRequestScopeApp,
  createNestSingletonApp,
  NestRootService,
  RequestRootService,
} from "../adapters/nestjs.ts";
import { createTsyringeScopedContainer, createTsyringeSingletonContainer } from "../adapters/tsyringe.ts";
import { RootService as TsyringeRootService } from "../adapters/tsyringe.ts";
import { getAdapter } from "../adapters/index.ts";
import type { AdapterName } from "../adapters/types.ts";
import { createTypedInjectInjector, TOKENS } from "../adapters/typed-inject.ts";
import { vanillaAdapter } from "../adapters/vanilla.ts";
import {
  createWyrlyScopedContainer,
  createWyrlySingletonContainer,
  RootServiceToken,
} from "../adapters/wyrly.ts";
import type { INestApplicationContext } from "@nestjs/common";
import type { Container as InversifyContainer } from "inversify";
import type { DependencyContainer } from "tsyringe";
import type { Injector } from "typed-inject";
import type { RootService } from "../graph/services.ts";
import type { Container } from "@wyrly/core";

type BenchAdd = {
  add: (
    name: string,
    fn: () => void | Promise<void>,
    opts?: {
      beforeAll?: () => void | Promise<void>;
      afterAll?: () => void | Promise<void>;
    },
  ) => Task;
};

export function addResolutionTasks(bench: BenchAdd, adapterName: AdapterName): void {
  const label = `${adapterName}/resolution`;

  switch (adapterName) {
    case "vanilla": {
      let ctx: Awaited<ReturnType<typeof vanillaAdapter.create>>;
      bench.add(
        label,
        () => {
          for (let i = 0; i < 100; i++) ctx.resolveRoot();
        },
        {
          beforeAll: async () => {
            ctx = await vanillaAdapter.create();
          },
          afterAll: async () => {
            await ctx.dispose();
          },
        },
      );
      break;
    }
    case "wyrly": {
      let container: Container;
      bench.add(
        label,
        () => {
          for (let i = 0; i < 100; i++) container.resolve(RootServiceToken).run();
        },
        {
          beforeAll: () => {
            container = createWyrlySingletonContainer();
            container.resolve(RootServiceToken);
          },
        },
      );
      break;
    }
    case "typed-inject": {
      let injector: Injector<{ [typeof TOKENS.RootService]: RootService }>;
      bench.add(
        label,
        () => {
          for (let i = 0; i < 100; i++) injector.resolve(TOKENS.RootService).run();
        },
        {
          beforeAll: () => {
            injector = createTypedInjectInjector();
            injector.resolve(TOKENS.RootService);
          },
        },
      );
      break;
    }
    case "tsyringe": {
      let container: DependencyContainer;
      bench.add(
        label,
        () => {
          for (let i = 0; i < 100; i++) container.resolve(TsyringeRootService).run();
        },
        {
          beforeAll: () => {
            container = createTsyringeSingletonContainer();
            container.resolve(TsyringeRootService);
          },
          afterAll: () => {
            container.clearInstances();
          },
        },
      );
      break;
    }
    case "inversify": {
      let container: InversifyContainer;
      bench.add(
        label,
        () => {
          for (let i = 0; i < 100; i++) container.get(InversifyRootService).run();
        },
        {
          beforeAll: () => {
            container = createInversifySingletonContainer();
            container.get(InversifyRootService);
          },
        },
      );
      break;
    }
    case "nestjs": {
      let app: INestApplicationContext;
      bench.add(
        label,
        () => {
          for (let i = 0; i < 100; i++) app.get(NestRootService).run();
        },
        {
          beforeAll: async () => {
            app = await createNestSingletonApp();
            app.get(NestRootService);
          },
          afterAll: async () => {
            await app.close();
          },
        },
      );
      break;
    }
  }
}

export function addColdStartTasks(bench: BenchAdd, adapterName: AdapterName): void {
  const label = `${adapterName}/cold_start`;

  switch (adapterName) {
    case "vanilla":
    case "wyrly":
    case "typed-inject":
    case "tsyringe":
    case "inversify":
      bench.add(label, async () => {
        const ctx = await getAdapter(adapterName).create();
        await ctx.dispose();
      });
      break;
    case "nestjs":
      bench.add(label, async () => {
        const app = await createNestSingletonApp();
        await app.close();
      });
      break;
  }
}

export function addColdStartResolutionTasks(bench: BenchAdd, adapterName: AdapterName): void {
  const label = `${adapterName}/cold_start_resolution`;

  switch (adapterName) {
    case "vanilla":
    case "wyrly":
    case "typed-inject":
    case "tsyringe":
    case "inversify":
      bench.add(label, async () => {
        const ctx = await getAdapter(adapterName).create();
        try {
          const result = ctx.resolveRoot();
          if (result instanceof Promise) await result;
        } finally {
          await ctx.dispose();
        }
      });
      break;
    case "nestjs":
      bench.add(label, async () => {
        const app = await createNestSingletonApp();
        try {
          app.get(NestRootService).run();
        } finally {
          await app.close();
        }
      });
      break;
  }
}

export function addRequestScopeTasks(bench: BenchAdd, adapterName: AdapterName): void {
  const label = `${adapterName}/request_scope`;

  switch (adapterName) {
    case "vanilla":
      bench.add(label, async () => {
        const ctx = await vanillaAdapter.createRequestScope();
        try {
          ctx.resolveRoot();
        } finally {
          await ctx.dispose();
        }
      });
      break;
    case "wyrly": {
      let container: Container;
      bench.add(
        label,
        async () => {
          const scope = container.createScope();
          try {
            scope.resolve(RootServiceToken).run();
          } finally {
            await scope.dispose();
          }
        },
        {
          beforeAll: () => {
            container = createWyrlyScopedContainer();
          },
        },
      );
      break;
    }
    case "typed-inject": {
      let injector: ReturnType<typeof createTypedInjectInjector>;
      bench.add(
        label,
        () => {
          const child = injector.createChildInjector();
          child.resolve(TOKENS.RootService).run();
        },
        {
          beforeAll: () => {
            injector = createTypedInjectInjector();
          },
        },
      );
      break;
    }
    case "tsyringe":
      bench.add(label, async () => {
        const container = createTsyringeScopedContainer();
        try {
          container.resolve(TsyringeRootService).run();
        } finally {
          container.clearInstances();
        }
      });
      break;
    case "inversify":
      bench.add(label, async () => {
        const container = createInversifyRequestScopeContainer();
        container.get(InversifyRootService).run();
      });
      break;
    case "nestjs":
      bench.add(label, async () => {
        const app = await createNestRequestScopeApp();
        try {
          const contextId = ContextIdFactory.create();
          app.registerRequestByContextId({}, contextId);
          const root = await app.resolve(RequestRootService, contextId);
          root.run();
        } finally {
          await app.close();
        }
      });
      break;
  }
}

export function registerSuiteTasks(
  bench: BenchAdd,
  suiteName: import("../adapters/types.ts").SuiteName,
  adapterName: AdapterName,
): void {
  switch (suiteName) {
    case "resolution":
      addResolutionTasks(bench, adapterName);
      break;
    case "cold_start":
      addColdStartTasks(bench, adapterName);
      break;
    case "cold_start_resolution":
      addColdStartResolutionTasks(bench, adapterName);
      break;
    case "request_scope":
      addRequestScopeTasks(bench, adapterName);
      break;
  }
}
