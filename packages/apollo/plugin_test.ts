import { assertEquals } from "jsr:@std/assert@1";
import { ApolloServer, type ApolloServerPlugin } from "@apollo/server";
import { createContainer, Injectable, token } from "@wyrly/core";
import { apolloDIPlugin, type ApolloServerContext } from "./mod.ts";

const PingToken = token<string>("Ping");

Deno.test("apolloDIPlugin disposes scope after executeOperation", async () => {
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

  const server = new ApolloServer<ApolloServerContext>({
    typeDefs: /* GraphQL */ `type Query { ping: String }`,
    resolvers: {
      Query: {
        ping: (_p: unknown, _a: unknown, ctx: ApolloServerContext) => {
          ctx.wyrly!.di.resolve(ScopedSvc);
          return ctx.wyrly!.di.resolve(PingToken);
        },
      },
    },
    plugins: [apolloDIPlugin(container) as ApolloServerPlugin<ApolloServerContext>],
  });

  const result = await server.executeOperation({ query: "{ ping }" });
  assertEquals(result.body.kind, "single");
  if (result.body.kind === "single") {
    assertEquals(result.body.singleResult.data?.ping, "pong");
  }
  assertEquals(disposed, true);
});

Deno.test("apolloDIPlugin configureScope runs per operation", async () => {
  const UserToken = token<string>("User");
  const container = createContainer();

  const server = new ApolloServer<ApolloServerContext>({
    typeDefs: /* GraphQL */ `type Query { who: String }`,
    resolvers: {
      Query: {
        who: (_p: unknown, _a: unknown, ctx: ApolloServerContext) =>
          ctx.wyrly!.di.resolve(UserToken),
      },
    },
    plugins: [
      apolloDIPlugin(container, {
        configureScope(scope) {
          scope.set(UserToken, "scoped-user");
        },
      }) as ApolloServerPlugin<ApolloServerContext>,
    ],
  });

  const result = await server.executeOperation({ query: "{ who }" });
  assertEquals(result.body.kind, "single");
  if (result.body.kind === "single") {
    assertEquals(result.body.singleResult.data?.who, "scoped-user");
  }
});
