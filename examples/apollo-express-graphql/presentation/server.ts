import type { Container } from "@wyrly/core";
import { ApolloServer, type ApolloServerPlugin } from "@apollo/server";
import { apolloDIPlugin, type ApolloServerContext, GraphQLRequestToken } from "@wyrly/apollo";
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

export function createApolloServer(container: Container) {
  const resolvers = {
    Query: {
      user: async (
        _parent: unknown,
        args: { id: string },
        ctx: ApolloServerContext,
      ) => {
        const loader = ctx.wyrly!.di.resolve(UserLoaderToken);
        return await loader.load(args.id);
      },
      users: async (
        _parent: unknown,
        args: { ids: string[] },
        ctx: ApolloServerContext,
      ) => {
        const loader = ctx.wyrly!.di.resolve(UserLoaderToken);
        const rows = await Promise.all(args.ids.map((id) => loader.load(id)));
        return rows.filter((u): u is NonNullable<typeof u> => u !== null);
      },
    },
  };

  return new ApolloServer<ApolloServerContext>({
    typeDefs,
    resolvers,
    plugins: [
      apolloDIPlugin(container, {
        configureScope(scope) {
          const request = scope.resolve(GraphQLRequestToken);
          const userId = request.headers.get("x-user-id") ?? "anonymous";
          scope.set(CurrentUserToken, { id: userId });
        },
      }) as ApolloServerPlugin<ApolloServerContext>,
    ],
  });
}
