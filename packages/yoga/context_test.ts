import { assertEquals } from "jsr:@std/assert@1";
import { createContainer, token } from "@wyrly/core";
import { createYogaDIContext, GraphQLRequestToken } from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("createYogaDIContext resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const request = new Request("https://example.com/graphql");
  const ctx = await createYogaDIContext(container, { request });
  assertEquals(ctx.di.resolve(PingToken), "pong");
  assertEquals(ctx.di.isDisposed(), false);
  await ctx.dispose();
  assertEquals(ctx.di.isDisposed(), true);
});

Deno.test("createYogaDIContext sets GraphQLRequestToken", async () => {
  const container = createContainer();
  const request = new Request("https://example.com/graphql");

  const ctx = await createYogaDIContext(container, { request });
  assertEquals(ctx.di.resolve(GraphQLRequestToken), request);
  await ctx.dispose();
});
