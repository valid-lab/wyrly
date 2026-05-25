import type { Container } from "@wyrly/core";
import { createGraphQLDIContext, type GraphQLDIContext } from "@wyrly/graphql";
import { ApolloServer, type ApolloServerPlugin, type BaseContext } from "@apollo/server";
import { CurrentUserToken } from "../composition/tokens.ts";
import { UserLoaderToken } from "../infrastructure/user_loader.ts";

const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
  }
  type Query {
    user(id: ID!): User
    users(ids: [ID!]!): [User]!
  }
`;

export type ApolloContext = BaseContext & {
  wyrly: GraphQLDIContext;
};

function wyrlyDisposePlugin(): ApolloServerPlugin<ApolloContext> {
  return {
    requestDidStart() {
      return Promise.resolve({
        willSendResponse: async (
          requestContext: { contextValue: ApolloContext },
        ) => {
          await requestContext.contextValue.wyrly.dispose();
        },
      });
    },
  };
}

export function createApolloServer(_container: Container) {
  const resolvers = {
    Query: {
      user: async (
        _parent: unknown,
        args: { id: string },
        ctx: ApolloContext,
      ) => {
        const loader = ctx.wyrly.di.resolve(UserLoaderToken);
        return await loader.load(args.id);
      },
      users: async (
        _parent: unknown,
        args: { ids: string[] },
        ctx: ApolloContext,
      ) => {
        const loader = ctx.wyrly.di.resolve(UserLoaderToken);
        const rows = await Promise.all(args.ids.map((id) => loader.load(id)));
        return rows.filter((u): u is NonNullable<typeof u> => u !== null);
      },
    },
  };

  return new ApolloServer<ApolloContext>({
    typeDefs,
    resolvers,
    plugins: [wyrlyDisposePlugin()],
  });
}

export async function createRequestContext(
  container: Container,
  options: { userId?: string } = {},
): Promise<ApolloContext> {
  const request = new Request("http://127.0.0.1/graphql", {
    method: "POST",
    headers: options.userId ? { "X-User-Id": options.userId } : {},
  });
  const wyrly = await createGraphQLDIContext(container, {
    request,
    configureScope(scope) {
      const userId = request.headers.get("x-user-id") ?? "anonymous";
      scope.set(CurrentUserToken, { id: userId });
    },
  });
  return { wyrly };
}
