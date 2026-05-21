import { assertEquals } from "jsr:@std/assert@1";
import { createContainer, Injectable } from "@wyrly/core";
import type { AfterScheduler } from "./types.ts";
import { createServerDI } from "./mod.ts";

Deno.test("createServerDI returns getDI", () => {
  const container = createContainer();
  const { getDI } = createServerDI(container, { after: () => {} });
  const scope = getDI();
  assertEquals(typeof scope.resolve, "function");
});

Deno.test("createServerDI getDI returns same scope within factory", () => {
  const container = createContainer();
  const { getDI } = createServerDI(container, { after: () => {} });
  assertEquals(getDI(), getDI());
});

Deno.test("createServerDI separate factories return different scopes", () => {
  const container = createContainer();
  const a = createServerDI(container, { after: () => {} });
  const b = createServerDI(container, { after: () => {} });
  assertEquals(a.getDI() === b.getDI(), false);
});

Deno.test("createServerDI after callback disposes scoped services", async () => {
  const container = createContainer();
  const log: string[] = [];
  const afterCallbacks: Array<() => void | Promise<void>> = [];
  const mockAfter: AfterScheduler = (cb) => {
    afterCallbacks.push(cb);
  };

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const { getDI } = createServerDI(container, { after: mockAfter });
  const scope = getDI();
  scope.resolve(ScopedSvc);
  assertEquals(log, []);
  assertEquals(afterCallbacks.length, 1);

  const result = afterCallbacks[0]!();
  if (result instanceof Promise) await result;
  assertEquals(log, ["disposed"]);
  assertEquals(scope.isDisposed(), true);
});

Deno.test("createServerDI double dispose is safe", async () => {
  const container = createContainer();
  let disposeCount = 0;
  const afterCallbacks: Array<() => void | Promise<void>> = [];
  const mockAfter: AfterScheduler = (cb) => {
    afterCallbacks.push(cb);
  };

  @Injectable({ lifetime: "scoped" })
  class Counted {
    dispose() {
      disposeCount++;
    }
  }
  container.register(Counted, { useClass: Counted, lifetime: "scoped" });

  const { getDI } = createServerDI(container, { after: mockAfter });
  const scope = getDI();
  scope.resolve(Counted);
  await scope.dispose();
  const result = afterCallbacks[0]!();
  if (result instanceof Promise) await result;
  assertEquals(disposeCount, 1);
});
