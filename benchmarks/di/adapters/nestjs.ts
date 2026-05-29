import "reflect-metadata";
import {
  Global,
  Inject,
  Injectable,
  Module,
  Scope,
} from "@nestjs/common";
import { ContextIdFactory, NestFactory } from "@nestjs/core";
import type { INestApplicationContext } from "@nestjs/common";
import type { BenchAdapter, BenchContext } from "./types.ts";

@Injectable()
class NestClientA {
  run(): string {
    return "a";
  }
}

@Injectable()
class NestClientB {
  run(): string {
    return "b";
  }
}

@Injectable()
class NestClientC {
  run(): string {
    return "c";
  }
}

@Injectable()
class NestStoreA {
  constructor(@Inject(NestClientA) public readonly client: NestClientA) {}

  run(): string {
    return this.client.run();
  }
}

@Injectable()
class NestStoreB {
  constructor(@Inject(NestClientB) public readonly client: NestClientB) {}

  run(): string {
    return this.client.run();
  }
}

@Injectable()
class NestStoreC {
  constructor(@Inject(NestClientC) public readonly client: NestClientC) {}

  run(): string {
    return this.client.run();
  }
}

@Injectable()
class NestServiceA {
  constructor(@Inject(NestStoreA) public readonly store: NestStoreA) {}

  run(): string {
    return this.store.run();
  }
}

@Injectable()
class NestServiceB {
  constructor(@Inject(NestStoreB) public readonly store: NestStoreB) {}

  run(): string {
    return this.store.run();
  }
}

@Injectable()
class NestServiceC {
  constructor(@Inject(NestStoreC) public readonly store: NestStoreC) {}

  run(): string {
    return this.store.run();
  }
}

@Injectable()
class NestRootService {
  constructor(
    @Inject(NestServiceA) public readonly serviceA: NestServiceA,
    @Inject(NestServiceB) public readonly serviceB: NestServiceB,
    @Inject(NestServiceC) public readonly serviceC: NestServiceC,
  ) {}

  run(): string {
    return `${this.serviceA.run()}-${this.serviceB.run()}-${this.serviceC.run()}`;
  }
}

@Global()
@Module({
  providers: [
    NestClientA,
    NestClientB,
    NestClientC,
    NestStoreA,
    NestStoreB,
    NestStoreC,
    NestServiceA,
    NestServiceB,
    NestServiceC,
    NestRootService,
  ],
  exports: [NestRootService],
})
class RootModule {}

@Injectable({ scope: Scope.REQUEST })
class RequestClientA {
  run(): string {
    return "a";
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestClientB {
  run(): string {
    return "b";
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestClientC {
  run(): string {
    return "c";
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestStoreA {
  constructor(@Inject(RequestClientA) public readonly client: RequestClientA) {}

  run(): string {
    return this.client.run();
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestStoreB {
  constructor(@Inject(RequestClientB) public readonly client: RequestClientB) {}

  run(): string {
    return this.client.run();
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestStoreC {
  constructor(@Inject(RequestClientC) public readonly client: RequestClientC) {}

  run(): string {
    return this.client.run();
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestServiceA {
  constructor(@Inject(RequestStoreA) public readonly store: RequestStoreA) {}

  run(): string {
    return this.store.run();
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestServiceB {
  constructor(@Inject(RequestStoreB) public readonly store: RequestStoreB) {}

  run(): string {
    return this.store.run();
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestServiceC {
  constructor(@Inject(RequestStoreC) public readonly store: RequestStoreC) {}

  run(): string {
    return this.store.run();
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestRootService {
  constructor(
    @Inject(RequestServiceA) public readonly serviceA: RequestServiceA,
    @Inject(RequestServiceB) public readonly serviceB: RequestServiceB,
    @Inject(RequestServiceC) public readonly serviceC: RequestServiceC,
  ) {}

  run(): string {
    return `${this.serviceA.run()}-${this.serviceB.run()}-${this.serviceC.run()}`;
  }
}

@Global()
@Module({
  providers: [
    RequestClientA,
    RequestClientB,
    RequestClientC,
    RequestStoreA,
    RequestStoreB,
    RequestStoreC,
    RequestServiceA,
    RequestServiceB,
    RequestServiceC,
    RequestRootService,
  ],
  exports: [RequestRootService],
})
class RequestScopeModule {}

export async function createNestSingletonApp(): Promise<INestApplicationContext> {
  return NestFactory.createApplicationContext(RootModule, { logger: false });
}

export async function createNestRequestScopeApp(): Promise<INestApplicationContext> {
  return NestFactory.createApplicationContext(RequestScopeModule, { logger: false });
}

async function createSingletonContext(): Promise<BenchContext> {
  const app = await createNestSingletonApp();
  return {
    resolveRoot: () => app.get(NestRootService).run(),
    dispose: () => app.close(),
  };
}

async function createRequestScopeContext(): Promise<BenchContext> {
  const app = await createNestRequestScopeApp();
  const contextId = ContextIdFactory.create();
  app.registerRequestByContextId({}, contextId);
  return {
    resolveRoot: async () => {
      const root = await app.resolve(RequestRootService, contextId);
      return root.run();
    },
    dispose: () => app.close(),
  };
}

export const nestjsAdapter: BenchAdapter = {
  name: "nestjs",

  create(): Promise<BenchContext> {
    return createSingletonContext();
  },

  createRequestScope(): Promise<BenchContext> {
    return createRequestScopeContext();
  },
};

export { NestRootService, RequestRootService };
