import assert from "node:assert/strict";
import { test } from "node:test";
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
    assert.equal(di.resolve(PingToken), "pong");
    return Response.json({ ok: true });
  });

  const res = await handler(testNextRequest(), { params: {} });
  assert.equal(res.status, 200);
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
    assert.equal(di.isDisposed(), false);
    return new Response(null, { status: 200 });
  });

  await handler(testNextRequest(), { params: {} });
  assert.deepEqual(log, ["disposed"]);
});
