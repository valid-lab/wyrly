import { assertEquals } from "jsr:@std/assert@1";
import type { NextRequest } from "npm:next@15/server.js";
import { createContainer, Injectable, token } from "@wyrly/core";
import { NextRequestToken, withDI } from "./mod.ts";

const PingToken = token<string>("Ping");
const CurrentUserToken = token<{ id: string }>("CurrentUser");

function testNextRequest(url = "https://example.com/"): NextRequest {
  return new Request(url) as NextRequest;
}

Deno.test("withDI resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const handler = withDI(container, (_req, { di }) => {
    assertEquals(di.resolve(PingToken), "pong");
    return Response.json({ ok: true });
  });

  const res = await handler(testNextRequest(), { params: {} });
  assertEquals(res.status, 200);
});

Deno.test("withDI passes sync and async params", async () => {
  const container = createContainer();
  const seen: string[] = [];

  const handler = withDI<{ id: string }>(container, (_req, { params }) => {
    seen.push(params.id);
    return new Response(null, { status: 200 });
  });

  await handler(testNextRequest(), { params: { id: "sync" } });
  await handler(testNextRequest(), { params: Promise.resolve({ id: "async" }) });
  assertEquals(seen, ["sync", "async"]);
});

Deno.test("withDI sets NextRequestToken", async () => {
  const container = createContainer();
  const req = testNextRequest("https://example.com/users/1");

  const handler = withDI(container, (request, { di }) => {
    assertEquals(di.resolve(NextRequestToken), request);
    return new Response(null, { status: 204 });
  });

  await handler(req, { params: {} });
});

Deno.test("withDI configureScope registers per-request values", async () => {
  const container = createContainer();
  const user = { id: "u1" };

  const handler = withDI(
    container,
    (_req, { di }) => {
      assertEquals(di.resolve(CurrentUserToken), user);
      return new Response(null, { status: 200 });
    },
    {
      configureScope(scope) {
        scope.set(CurrentUserToken, user);
      },
    },
  );

  await handler(testNextRequest(), { params: {} });
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

  const handler = withDI(container, (_req, { di }) => {
    di.resolve(ScopedSvc);
    assertEquals(di.isDisposed(), false);
    return new Response(null, { status: 200 });
  });

  await handler(testNextRequest(), { params: {} });
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

  const handler = withDI(container, (_req, { di }) => {
    di.resolve(ScopedSvc);
    throw new Error("handler error");
  });

  try {
    await handler(testNextRequest(), { params: {} });
  } catch {
    // expected
  }
  assertEquals(log, ["disposed"]);
});
