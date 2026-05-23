import assert from "node:assert/strict";
import { test } from "node:test";
import { createContainer, Injectable, token } from "@wyrly/core";

test("token + useValue + resolve", () => {
  const T = token<number>("T");
  const c = createContainer();
  c.register(T, { useValue: 42 });
  assert.equal(c.resolve(T), 42);
});

test("@Injectable scoped + scope.dispose", async () => {
  const c = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  c.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const scope = c.createScope();
  scope.resolve(ScopedSvc);
  await scope.dispose();
  assert.deepEqual(log, ["disposed"]);
});

test("Symbol.asyncDispose on scoped instance", async () => {
  const c = createContainer();
  const log: number[] = [];
  const T = token<{ [Symbol.asyncDispose](): Promise<void> }>("AsyncDispose");

  c.register(T, {
    deps: [],
    useFactory: () => ({
      async [Symbol.asyncDispose]() {
        await Promise.resolve();
        log.push(1);
      },
    }),
    lifetime: "scoped",
  });

  const scope = c.createScope();
  scope.resolve(T);
  await scope.dispose();
  assert.deepEqual(log, [1]);
});
