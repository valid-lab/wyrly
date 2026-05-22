import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("wyrly hono worker", () => {
  it("resolves token via di middleware", async () => {
    const res = await SELF.fetch("http://example.com/");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ping: string };
    expect(body.ping).toBe("pong");
  });

  it("disposes scoped provider after handler", async () => {
    const res = await SELF.fetch("http://example.com/scoped");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { disposedInHandler: boolean };
    expect(body.disposedInHandler).toBe(false);
  });
});
