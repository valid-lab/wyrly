import { assertEquals } from "jsr:@std/assert@1";
import { createContainer, token } from "@wyrly/core";
import {
  ApolloRequestToken,
  createApolloDIContext,
  GraphQLRequestToken,
  toFetchRequest,
} from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("createApolloDIContext resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const request = new Request("https://example.com/graphql");
  const ctx = await createApolloDIContext(container, { request });
  assertEquals(ctx.di.resolve(PingToken), "pong");
  assertEquals(ctx.di.isDisposed(), false);
  await ctx.dispose();
  assertEquals(ctx.di.isDisposed(), true);
});

Deno.test("createApolloDIContext sets GraphQLRequestToken", async () => {
  const container = createContainer();
  const request = new Request("https://example.com/graphql");

  const ctx = await createApolloDIContext(container, { request });
  assertEquals(ctx.di.resolve(GraphQLRequestToken), request);
  await ctx.dispose();
});

Deno.test("createApolloDIContext sets ApolloRequestToken from apolloHttp", async () => {
  const container = createContainer();
  const nodeReq = {
    method: "POST",
    url: "/graphql",
    headers: { "x-user-id": "u1" },
  };
  const ctx = await createApolloDIContext(container, {
    request: toFetchRequest(nodeReq),
    apolloHttp: { req: nodeReq },
  });
  assertEquals(ctx.di.resolve(ApolloRequestToken), nodeReq);
  await ctx.dispose();
});
