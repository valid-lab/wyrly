import { expect, test } from "bun:test";
import type { NextRequest } from "next/server";
import { createContainer, Injectable, token } from "@wyrly/core";
import { withDI } from "@wyrly/next";

const PingToken = token<string>("Ping");

function testNextRequest(url = "https://example.com/"): NextRequest {
  return new Request(url) as NextRequest;
}

test("withDI resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const handler = withDI(container, (_req, { di }) => {
    expect(di.resolve(PingToken)).toBe("pong");
    return Response.json({ ok: true });
  });

  const res = await handler(testNextRequest(), { params: {} });
  expect(res.status).toBe(200);
});

test("withDI disposes scope after handler completes", async () => {
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
    expect(di.isDisposed()).toBe(false);
    return new Response(null, { status: 200 });
  });

  await handler(testNextRequest(), { params: {} });
  expect(log).toEqual(["disposed"]);
});
