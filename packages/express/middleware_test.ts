import { assert, assertEquals } from "jsr:@std/assert@1";
import express from "express";
import { createContainer, Injectable, token } from "@wyrly/core";
import { asExpressRequestWithDI, diMiddleware, ExpressRequestToken } from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("diMiddleware attaches req.di and resolves tokens", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const app = express();
  app.use(diMiddleware(container));

  let seenReq = false;
  app.get("/", (req, res) => {
    const r = asExpressRequestWithDI(req);
    assert(r.di);
    assertEquals(r.di.resolve(PingToken), "pong");
    assertEquals(r.di.resolve(ExpressRequestToken), req);
    seenReq = true;
    res.status(200).end("ok");
  });

  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/`);
    assertEquals(res.status, 200);
    await res.text();
    assert(seenReq);
  } finally {
    await closeServer(server);
  }
});

Deno.test("diMiddleware disposes scope after response finish", async () => {
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

  let disposedAfterHandler = false;
  app.get("/", (req, res) => {
    const r = asExpressRequestWithDI(req);
    r.di.resolve(ScopedSvc);
    disposedAfterHandler = r.di.isDisposed();
    res.status(200).end("ok");
  });

  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/`);
    assertEquals(res.status, 200);
    await res.text();
    assertEquals(disposedAfterHandler, false);
    await new Promise((r) => setTimeout(r, 50));
    assertEquals(log, ["disposed"]);
  } finally {
    await closeServer(server);
  }
});

Deno.test("diMiddleware double dispose on finish and close is safe", async () => {
  const container = createContainer();
  let disposeCount = 0;

  @Injectable({ lifetime: "scoped" })
  class Counted {
    dispose() {
      disposeCount++;
    }
  }
  container.register(Counted, { useClass: Counted, lifetime: "scoped" });

  const app = express();
  app.use(diMiddleware(container));
  app.get("/", (req, res) => {
    asExpressRequestWithDI(req).di.resolve(Counted);
    res.status(200).end("ok");
  });

  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/`);
    assertEquals(res.status, 200);
    await res.text();
    await new Promise((r) => setTimeout(r, 50));
    assertEquals(disposeCount, 1);
  } finally {
    await closeServer(server);
  }
});

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

function closeServer(server: TestServer): Promise<void> {
  return server.close();
}
