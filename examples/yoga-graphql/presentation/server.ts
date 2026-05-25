import type { Container } from "@wyrly/core";
import {
  GraphQLRequestToken,
  yogaContext,
  yogaDIPlugin,
  type YogaServerContext,
} from "@wyrly/yoga";
import { createSchema, createYoga } from "graphql-yoga";
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

export function createYogaServer(container: Container) {
  const resolvers = {
    Query: {
      user: async (
        _parent: unknown,
        args: { id: string },
        ctx: YogaServerContext,
      ) => {
        const loader = ctx.wyrly.di.resolve(UserLoaderToken);
        return await loader.load(args.id);
      },
      users: async (
        _parent: unknown,
        args: { ids: string[] },
        ctx: YogaServerContext,
      ) => {
        const loader = ctx.wyrly.di.resolve(UserLoaderToken);
        return await Promise.all(args.ids.map((id) => loader.load(id)));
      },
    },
  };

  return createYoga<YogaServerContext>({
    schema: createSchema({ typeDefs, resolvers }),
    plugins: [
      yogaDIPlugin(container, {
        configureScope(scope) {
          const request = scope.resolve(GraphQLRequestToken);
          const userId = request.headers.get("x-user-id") ?? "anonymous";
          scope.set(CurrentUserToken, { id: userId });
        },
      }),
    ],
    context: yogaContext,
  });
}
