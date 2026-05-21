import { assertEquals } from "jsr:@std/assert@1";
import { createContainer, Injectable, token } from "@wyrly/core";
import { withActionDI } from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("withActionDI resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const action = withActionDI(container, (di, _formData) => {
    assertEquals(di.resolve(PingToken), "pong");
  });

  await action(new FormData());
});

Deno.test("withActionDI disposes scope after action completes", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const action = withActionDI(container, (di, _formData) => {
    di.resolve(ScopedSvc);
    assertEquals(di.isDisposed(), false);
  });

  await action(new FormData());
  assertEquals(log, ["disposed"]);
});
