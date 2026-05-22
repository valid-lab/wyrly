import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { createContainer, Injectable, token } from "@wyrly/core";
import { asExpressRequestWithDI, diMiddleware, ExpressRequestToken } from "@wyrly/express";

const PingToken = token<string>("Ping");

interface TestServer {
  port: number;
  close(): Promise<void>;
}

function listen(app: express.Application): Promise<TestServer> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (addr === null || typeof addr === "string") {
        reject(new Error("unexpected listen address"));
        return;
      }
      resolve({
        port: addr.port,
        close: () =>
          new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });
    server.on("error", reject);
  });
}

test("diMiddleware attaches req.di and resolves tokens", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const app = express();
  app.use(diMiddleware(container));

  let seenReq = false;
  app.get("/", (req, res) => {
    const r = asExpressRequestWithDI(req);
    assert.ok(r.di);
    assert.equal(r.di.resolve(PingToken), "pong");
    assert.equal(r.di.resolve(ExpressRequestToken), req);
    seenReq = true;
    res.status(200).end("ok");
  });

  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/`);
    assert.equal(res.status, 200);
    await res.text();
    assert.equal(seenReq, true);
  } finally {
    await server.close();
  }
});

test("diMiddleware disposes scope after response finish", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const app = express();
  app.use(diMiddleware(container));

  app.get("/", (req, res) => {
    const r = asExpressRequestWithDI(req);
    r.di.resolve(ScopedSvc);
    assert.equal(r.di.isDisposed(), false);
    res.status(200).end("ok");
  });

  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/`);
    assert.equal(res.status, 200);
    await res.text();
    await new Promise((r) => setTimeout(r, 50));
    assert.deepEqual(log, ["disposed"]);
  } finally {
    await server.close();
  }
});
