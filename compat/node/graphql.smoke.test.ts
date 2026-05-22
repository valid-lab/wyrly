import assert from "node:assert/strict";
import { test } from "node:test";
import { createContainer, Injectable, token } from "@wyrly/core";
import { createGraphQLDIContext, GraphQLRequestToken } from "@wyrly/graphql";

const PingToken = token<string>("Ping");

test("createGraphQLDIContext resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const ctx = await createGraphQLDIContext(container);
  assert.equal(ctx.di.resolve(PingToken), "pong");
  assert.equal(ctx.di.isDisposed(), false);
  await ctx.dispose();
  assert.equal(ctx.di.isDisposed(), true);
});

test("createGraphQLDIContext sets request token", async () => {
  const container = createContainer();
  const request = new Request("https://example.com/graphql");

  const ctx = await createGraphQLDIContext(container, { request });
  assert.equal(ctx.di.resolve(GraphQLRequestToken), request);
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
  assert.deepEqual(log, ["disposed"]);
});
