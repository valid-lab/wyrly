import { expect, test } from "bun:test";
import { createContainer, Injectable, token } from "@wyrly/core";
import { createGraphQLDIContext, GraphQLRequestToken } from "@wyrly/graphql";

const PingToken = token<string>("Ping");

test("createGraphQLDIContext resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const ctx = await createGraphQLDIContext(container);
  expect(ctx.di.resolve(PingToken)).toBe("pong");
  expect(ctx.di.isDisposed()).toBe(false);
  await ctx.dispose();
  expect(ctx.di.isDisposed()).toBe(true);
});

test("createGraphQLDIContext sets request token", async () => {
  const container = createContainer();
  const request = new Request("https://example.com/graphql");

  const ctx = await createGraphQLDIContext(container, { request });
  expect(ctx.di.resolve(GraphQLRequestToken)).toBe(request);
  await ctx.dispose();
});

test("createGraphQLDIContext dispose runs scoped disposers", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const ctx = await createGraphQLDIContext(container);
  ctx.di.resolve(ScopedSvc);
  await ctx.dispose();
  expect(log).toEqual(["disposed"]);
});
