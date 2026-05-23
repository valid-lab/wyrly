import { assert, assertEquals, assertThrows } from "jsr:@std/assert@1";
import {
  CircularDependencyError,
  createContainer,
  DuplicateProviderError,
  Injectable,
  InvalidProviderError,
  LifetimeViolationError,
  ProviderNotFoundError,
  ScopeDisposedError,
  token,
} from "./mod.ts";

Deno.test("token + useValue + resolve", () => {
  const T = token<number>("T");
  const c = createContainer();
  c.register(T, { useValue: 42 });
  assertEquals(c.resolve(T), 42);
});

Deno.test("scoped from root container throws", () => {
  const c = createContainer();
  const S = token<string>("S");
  c.register(S, { useValue: "x", lifetime: "singleton" });
  @Injectable({ lifetime: "scoped", deps: [S] })
  class A {
    constructor(public s: string) {}
  }
  c.register(A, { useClass: A, lifetime: "scoped" });
  assertThrows(() => c.resolve(A), InvalidProviderError);
});

Deno.test("scoped resolve + dispose", async () => {
  const c = createContainer();
  const S = token<string>("S");
  c.register(S, { useValue: "scoped-dep", lifetime: "singleton" });
  @Injectable({ lifetime: "scoped", deps: [S] })
  class A {
    constructor(public s: string) {}
  }
  c.register(A, { useClass: A, lifetime: "scoped" });
  const scope = c.createScope();
  const a1 = scope.resolve(A);
  const a2 = scope.resolve(A);
  assert(a1 === a2);
  await scope.dispose();
  assertThrows(() => scope.resolve(A), ScopeDisposedError);
});

Deno.test("duplicate register throws", () => {
  const T = token<number>("T");
  const c = createContainer();
  c.register(T, { useValue: 1 });
  assertThrows(() => c.register(T, { useValue: 2 }), DuplicateProviderError);
});

Deno.test("override replaces provider", () => {
  const T = token<number>("T");
  const c = createContainer();
  c.register(T, { useValue: 1 });
  c.override(T, { useValue: 2 });
  assertEquals(c.resolve(T), 2);
});

Deno.test("circular dependency", () => {
  const c = createContainer();
  class A {
    constructor(public b: B) {}
  }
  class B {
    constructor(public a: A) {}
  }
  c.register(A, { useClass: A, deps: [B], lifetime: "singleton" });
  c.register(B, { useClass: B, deps: [A], lifetime: "singleton" });
  assertThrows(() => c.resolve(A), CircularDependencyError);
});

Deno.test("singleton cannot depend on scoped", () => {
  const c = createContainer();
  const S = token<string>("S");
  c.register(S, { useValue: "v", lifetime: "singleton" });
  @Injectable({ lifetime: "scoped", deps: [S] })
  class ScopedSvc {
    constructor(public s: string) {}
  }
  c.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });
  @Injectable({ lifetime: "singleton", deps: [ScopedSvc] })
  class Bad {
    constructor(_x: ScopedSvc) {}
  }
  c.register(Bad, { useClass: Bad, lifetime: "singleton" });
  const scope = c.createScope();
  assertThrows(() => scope.resolve(Bad), LifetimeViolationError);
});

Deno.test("register class uses @Injectable metadata", () => {
  const c = createContainer();
  const S = token<string>("S");
  c.register(S, { useValue: "meta", lifetime: "singleton" });
  @Injectable({ deps: [S], lifetime: "singleton" })
  class Svc {
    constructor(public s: string) {}
  }
  c.register(Svc);
  assertEquals(c.resolve(Svc).s, "meta");
});

Deno.test("scope.set wins over provider", () => {
  const c = createContainer();
  const T = token<number>("T");
  c.register(T, { useValue: 1, lifetime: "singleton" });
  const scope = c.createScope();
  scope.set(T, 99);
  assertEquals(scope.resolve(T), 99);
});

Deno.test("inspect returns nodes and edges", () => {
  const c = createContainer();
  const A = token<number>("A");
  const B = token<number>("B");
  c.register(A, {
    deps: [B],
    useFactory: () => 1,
    lifetime: "singleton",
  });
  c.register(B, { useValue: 2, lifetime: "singleton" });
  const g = c.inspect();
  assert(g.nodes.length >= 2);
  assert(g.edges.some((e) => e.to.includes("B")));
});

Deno.test("validate detects singleton depends on scoped", () => {
  const c = createContainer();
  const S = token<string>("S");
  c.register(S, { useValue: "v", lifetime: "singleton" });
  @Injectable({ lifetime: "scoped", deps: [S] })
  class ScopedSvc {
    constructor(_s: string) {}
  }
  c.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });
  @Injectable({ lifetime: "singleton", deps: [ScopedSvc] })
  class Bad {
    constructor(_x: ScopedSvc) {}
  }
  c.register(Bad, { useClass: Bad, lifetime: "singleton" });
  const r = c.validate();
  assert(!r.ok);
  assert(r.issues.some((i) => i.code === "singleton_depends_on_scoped"));
});

Deno.test("ProviderNotFound for unknown token", () => {
  const c = createContainer();
  const X = token<unknown>("X");
  assertThrows(() => c.resolve(X), ProviderNotFoundError);
});

Deno.test("dispose calls disposers in reverse creation order", async () => {
  const c = createContainer();
  const log: number[] = [];
  const A = token<{ dispose(): void }>("A");
  const B = token<{ dispose(): void }>("B");
  c.register(B, {
    deps: [],
    useFactory: () => ({
      dispose() {
        log.push(2);
      },
    }),
    lifetime: "scoped",
  });
  c.register(A, {
    deps: [B],
    useFactory: () => {
      return {
        dispose() {
          log.push(1);
        },
      };
    },
    lifetime: "scoped",
  });
  const scope = c.createScope();
  scope.resolve(A);
  await scope.dispose();
  assertEquals(log, [1, 2]);
});
