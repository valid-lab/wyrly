import { assert, assertEquals } from "jsr:@std/assert@1";
import { App } from "fresh";
import type { Context } from "fresh";
import { createContainer, Injectable, token } from "@wyrly/core";
import { di, FreshContextToken, type FreshDIState, RequestToken } from "./mod.ts";

const PingToken = token<string>("Ping");
const CurrentUserToken = token<{ id: string }>("CurrentUser");

Deno.test("di attaches ctx.state.di and resolves tokens", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  let seen = false;
  const handler = new App<FreshDIState>()
    .use(di(container))
    .get("/", (ctx) => {
      const scope = ctx.state.di;
      assertEquals(scope.resolve(PingToken), "pong");
      assertEquals(scope.resolve(FreshContextToken), ctx);
      assertEquals(scope.resolve(RequestToken), ctx.req);
      seen = true;
      return new Response("ok");
    })
    .handler();

  const res = await handler(new Request("http://localhost/"));
  assertEquals(res.status, 200);
  await res.text();
  assert(seen);
});

Deno.test("di configureScope registers per-request values", async () => {
  const container = createContainer();
  const user = { id: "u1" };

  const handler = new App<FreshDIState>()
    .use(di(container, {
      configureScope(scope) {
        scope.set(CurrentUserToken, user);
      },
    }))
    .get("/", (ctx) => {
      assertEquals(ctx.state.di.resolve(CurrentUserToken), user);
      return new Response(null, { status: 204 });
    })
    .handler();

  const res = await handler(new Request("http://localhost/"));
  assertEquals(res.status, 204);
});

Deno.test("di configureScope supports async", async () => {
  const container = createContainer();
  const user = { id: "async" };

  const handler = new App<FreshDIState>()
    .use(di(container, {
      async configureScope(scope) {
        await Promise.resolve();
        scope.set(CurrentUserToken, user);
      },
    }))
    .get("/", (ctx) => {
      assertEquals(ctx.state.di.resolve(CurrentUserToken), user);
      return new Response(null, { status: 204 });
    })
    .handler();

  const res = await handler(new Request("http://localhost/"));
  assertEquals(res.status, 204);
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

  let disposedInHandler = false;
  const handler = new App<FreshDIState>()
    .use(di(container))
    .get("/", (ctx) => {
      ctx.state.di.resolve(ScopedSvc);
      disposedInHandler = ctx.state.di.isDisposed();
      return new Response("ok");
    })
    .handler();

  const res = await handler(new Request("http://localhost/"));
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

  const middleware = di(container);
  const ctx = {
    req: new Request("http://localhost/"),
    state: {} as FreshDIState,
    next() {
      ctx.state.di.resolve(ScopedSvc);
      throw new Error("handler error");
    },
  } as unknown as Context<FreshDIState>;

  try {
    await middleware(ctx);
  } catch {
    // expected
  }
  assertEquals(log, ["disposed"]);
});
