import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { createContainer, Injectable, token } from "@wyrly/core";
import { createSchema, createYoga } from "graphql-yoga";
import { yogaContext, yogaDIPlugin, type YogaServerContext } from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("yogaDIPlugin disposes scope after yoga.fetch", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  let disposed = false;
  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      disposed = true;
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const yoga = createYoga({
    schema: createSchema({
      typeDefs: /* GraphQL */ `type Query { ping: String }`,
      resolvers: {
        Query: {
          ping: (_p: unknown, _a: unknown, ctx: YogaServerContext) => {
            ctx.wyrly.di.resolve(ScopedSvc);
            return ctx.wyrly.di.resolve(PingToken);
          },
        },
      },
    }),
    plugins: [yogaDIPlugin(container)],
    context: yogaContext,
  });

  const res = await yoga.fetch("http://127.0.0.1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ ping }" }),
  });
  assertEquals(res.status, 200);
  const json = await res.json() as { data?: { ping?: string } };
  assertEquals(json.data?.ping, "pong");
  assertEquals(disposed, true);
});

Deno.test("yogaContext throws when plugin is missing", () => {
  assertThrows(
    () => yogaContext({ request: new Request("https://example.com/graphql") }),
    Error,
    "yogaDIPlugin",
  );
});
