/** Leaf clients — no dependencies. */
export class ClientA {
  run(): string {
    return "a";
  }
}

export class ClientB {
  run(): string {
    return "b";
  }
}

export class ClientC {
  run(): string {
    return "c";
  }
}

/** Stores depend on a single client each. */
export class StoreA {
  constructor(public readonly client: ClientA) {}

  run(): string {
    return this.client.run();
  }
}

export class StoreB {
  constructor(public readonly client: ClientB) {}

  run(): string {
    return this.client.run();
  }
}

export class StoreC {
  constructor(public readonly client: ClientC) {}

  run(): string {
    return this.client.run();
  }
}

/** Services depend on a single store each. */
export class ServiceA {
  constructor(public readonly store: StoreA) {}

  run(): string {
    return this.store.run();
  }
}

export class ServiceB {
  constructor(public readonly store: StoreB) {}

  run(): string {
    return this.store.run();
  }
}

export class ServiceC {
  constructor(public readonly store: StoreC) {}

  run(): string {
    return this.store.run();
  }
}

/**
 * Root entry point. Resolving this walks 9 dependencies (3 services + 3 stores + 3 clients).
 */
export class RootService {
  constructor(
    public readonly serviceA: ServiceA,
    public readonly serviceB: ServiceB,
    public readonly serviceC: ServiceC,
  ) {}

  run(): string {
    return `${this.serviceA.run()}-${this.serviceB.run()}-${this.serviceC.run()}`;
  }
}
