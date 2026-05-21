import { assertEquals } from "jsr:@std/assert@1";
import type { Context } from "fresh";
import { createContainer, Injectable, token } from "@wyrly/core";
import { FreshContextToken, type FreshDIState, RequestToken, withDI } from "./mod.ts";

const PingToken = token<string>("Ping");
const CurrentUserToken = token<{ id: string }>("CurrentUser");

Deno.test("withDI passes di and resolves tokens", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const handler = withDI(container, (ctx) => {
    assertEquals(ctx.di.resolve(PingToken), "pong");
    assertEquals(ctx.state.di, ctx.di);
    assertEquals(ctx.di.resolve(FreshContextToken), ctx);
    assertEquals(ctx.di.resolve(RequestToken), ctx.req);
    return new Response("ok");
  });

  const res = await handler(testFreshContext("http://localhost/")) as Response;
  assertEquals(res.status, 200);
});

Deno.test("withDI preserves route params and request", async () => {
  const container = createContainer();
  const seen: string[] = [];

  const handler = withDI(container, (ctx) => {
    assertEquals(ctx.params.id, "u1");
    seen.push(ctx.params.id ?? "");
    seen.push(new URL(ctx.req.url).pathname);
    return new Response(null, { status: 204 });
  });

  const res = await handler(
    testFreshContext("http://localhost/users/u1", { id: "u1" }),
  ) as Response;
  assertEquals(res.status, 204);
  assertEquals(seen, ["u1", "/users/u1"]);
});

Deno.test("withDI configureScope registers per-request values", async () => {
  const container = createContainer();
  const user = { id: "u1" };

  const handler = withDI(
    container,
    (ctx) => {
      assertEquals(ctx.di.resolve(CurrentUserToken), user);
      return new Response(null, { status: 204 });
    },
    {
      configureScope(scope) {
        scope.set(CurrentUserToken, user);
      },
    },
  );

  const res = await handler(testFreshContext("http://localhost/")) as Response;
  assertEquals(res.status, 204);
});

Deno.test("withDI disposes scope after handler completes", async () => {
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
  const handler = withDI(container, (ctx) => {
    ctx.di.resolve(ScopedSvc);
    disposedInHandler = ctx.di.isDisposed();
    return new Response("ok");
  });

  const res = await handler(testFreshContext("http://localhost/")) as Response;
  assertEquals(res.status, 200);
  await res.text();
  assertEquals(disposedInHandler, false);
  assertEquals(log, ["disposed"]);
});

Deno.test("withDI disposes scope when handler throws", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const handler = withDI(container, (ctx) => {
    ctx.di.resolve(ScopedSvc);
    throw new Error("handler error");
  });

  try {
    await handler(testFreshContext("http://localhost/"));
  } catch {
    // expected
  }
  assertEquals(log, ["disposed"]);
});

function testFreshContext(
  url: string,
  params: Record<string, string> = {},
): Context<FreshDIState> {
  return {
    req: new Request(url),
    state: {} as FreshDIState,
    params,
  } as Context<FreshDIState>;
}
