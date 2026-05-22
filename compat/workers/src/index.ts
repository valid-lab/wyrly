import { Hono } from "hono";
import { createContainer, Injectable, token } from "@wyrly/core";
import { di, getDI } from "@wyrly/hono";

const PingToken = token<string>("Ping");

const container = createContainer();
container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

@Injectable({ lifetime: "scoped" })
class ScopedSvc {
  disposed = false;
  dispose() {
    this.disposed = true;
  }
}
container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

const app = new Hono();
app.use(di(container));

app.get("/", (c) => {
  const ping = getDI(c).resolve(PingToken);
  return c.json({ ping });
});

app.get("/scoped", (c) => {
  const svc = getDI(c).resolve(ScopedSvc);
  return c.json({ disposedInHandler: svc.disposed });
});

export default app;
