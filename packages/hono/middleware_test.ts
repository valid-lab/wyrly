import { assert, assertEquals } from "jsr:@std/assert@1";
import { Hono } from "hono";
import { createContainer, Injectable, token } from "@wyrly/core";
import { di, HonoContextToken, RequestToken } from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("di attaches c.get di and resolves tokens", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const app = new Hono();
  app.use(di(container));

  let seen = false;
  app.get("/", (c) => {
    const scope = c.get("di");
    assertEquals(scope.resolve(PingToken), "pong");
    assertEquals(scope.resolve(HonoContextToken), c);
    assertEquals(scope.resolve(RequestToken), c.req.raw);
    seen = true;
    return c.text("ok");
  });

  const res = await app.request("/");
  assertEquals(res.status, 200);
  await res.text();
  assert(seen);
});

Deno.test("di disposes scope after handler completes", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const app = new Hono();
  app.use(di(container));

  let disposedInHandler = false;
  app.get("/", (c) => {
    c.get("di").resolve(ScopedSvc);
    disposedInHandler = c.get("di").isDisposed();
    return c.text("ok");
  });

  const res = await app.request("/");
  assertEquals(res.status, 200);
  await res.text();
  assertEquals(disposedInHandler, false);
  assertEquals(log, ["disposed"]);
});

Deno.test("di disposes scope when handler throws", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const app = new Hono();
  app.use(di(container));
  app.get("/", (c) => {
    c.get("di").resolve(ScopedSvc);
    throw new Error("handler error");
  });
  app.onError(() => new Response("error", { status: 500 }));

  const res = await app.request("/");
  assertEquals(res.status, 500);
  await res.text();
  assertEquals(log, ["disposed"]);
});

Deno.test("di disposes only once when handler throws", async () => {
  const container = createContainer();
  let disposeCount = 0;

  @Injectable({ lifetime: "scoped" })
  class Counted {
    dispose() {
      disposeCount++;
    }
  }
  container.register(Counted, { useClass: Counted, lifetime: "scoped" });

  const app = new Hono();
  app.use(di(container));
  app.get("/", (c) => {
    c.get("di").resolve(Counted);
    throw new Error("fail");
  });
  app.onError(() => new Response(null, { status: 500 }));

  await app.request("/");
  assertEquals(disposeCount, 1);
});
