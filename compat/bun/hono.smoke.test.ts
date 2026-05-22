import { expect, test } from "bun:test";
import { Hono } from "hono";
import { createContainer, Injectable, token } from "@wyrly/core";
import { di, getDI } from "@wyrly/hono";

const PingToken = token<string>("Ping");

test("di attaches scope and resolves tokens", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const app = new Hono();
  app.use(di(container));

  let seen = false;
  app.get("/", (c) => {
    expect(getDI(c).resolve(PingToken)).toBe("pong");
    seen = true;
    return c.text("ok");
  });

  const res = await app.request("/");
  expect(res.status).toBe(200);
  await res.text();
  expect(seen).toBe(true);
});

test("di disposes scope after handler completes", async () => {
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
    getDI(c).resolve(ScopedSvc);
    expect(getDI(c).isDisposed()).toBe(false);
    return c.text("ok");
  });

  const res = await app.request("/");
  expect(res.status).toBe(200);
  await res.text();
  expect(log).toEqual(["disposed"]);
});
