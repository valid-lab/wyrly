import { assertEquals } from "jsr:@std/assert@1";
import { createContainer, Injectable, token } from "@wyrly/core";
import { createGraphQLDIContext, GraphQLRequestToken, GraphQLResponseToken } from "./mod.ts";

const PingToken = token<string>("Ping");
const CurrentUserToken = token<{ id: string }>("CurrentUser");

Deno.test("createGraphQLDIContext resolves from di scope", async () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const ctx = await createGraphQLDIContext(container);
  assertEquals(ctx.di.resolve(PingToken), "pong");
  assertEquals(ctx.di.isDisposed(), false);
  await ctx.dispose();
  assertEquals(ctx.di.isDisposed(), true);
});

Deno.test("createGraphQLDIContext sets request and response tokens", async () => {
  const container = createContainer();
  const request = new Request("https://example.com/graphql");
  const response = new Response();

  const ctx = await createGraphQLDIContext(container, { request, response });
  assertEquals(ctx.di.resolve(GraphQLRequestToken), request);
  assertEquals(ctx.di.resolve(GraphQLResponseToken), response);
  await ctx.dispose();
});

Deno.test("createGraphQLDIContext configureScope registers per-request values", async () => {
  const container = createContainer();
  const user = { id: "u1" };

  const ctx = await createGraphQLDIContext(container, {
    configureScope(scope) {
      scope.set(CurrentUserToken, user);
    },
  });
  assertEquals(ctx.di.resolve(CurrentUserToken), user);
  await ctx.dispose();
});

Deno.test("createGraphQLDIContext configureScope supports async", async () => {
  const container = createContainer();
  const user = { id: "async" };

  const ctx = await createGraphQLDIContext(container, {
    async configureScope(scope) {
      await Promise.resolve();
      scope.set(CurrentUserToken, user);
    },
  });
  assertEquals(ctx.di.resolve(CurrentUserToken), user);
  await ctx.dispose();
});

Deno.test("createGraphQLDIContext dispose runs scoped disposers", async () => {
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
  assertEquals(ctx.di.isDisposed(), false);
  await ctx.dispose();
  assertEquals(log, ["disposed"]);
  assertEquals(ctx.di.isDisposed(), true);
});

Deno.test("createGraphQLDIContext double dispose is safe", async () => {
  const container = createContainer();
  let disposeCount = 0;

  @Injectable({ lifetime: "scoped" })
  class Counted {
    dispose() {
      disposeCount++;
    }
  }
  container.register(Counted, { useClass: Counted, lifetime: "scoped" });

  const ctx = await createGraphQLDIContext(container);
  ctx.di.resolve(Counted);
  await ctx.dispose();
  await ctx.dispose();
  assertEquals(disposeCount, 1);
});
