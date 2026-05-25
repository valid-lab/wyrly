import type { Container } from "@wyrly/core";
import { createGraphQLDIContext, type GraphQLDIContext } from "@wyrly/graphql";
import { createSchema, createYoga, type Plugin } from "graphql-yoga";
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

type YogaContext = {
  wyrly: GraphQLDIContext;
};

const requestContexts = new WeakMap<Request, GraphQLDIContext>();

function wyrlyDIPlugin(container: Container): Plugin {
  return {
    async onRequest({ request }) {
      const wyrly = await createGraphQLDIContext(container, {
        request,
        configureScope(scope) {
          const userId = request.headers.get("x-user-id") ?? "anonymous";
          scope.set(CurrentUserToken, { id: userId });
        },
      });
      requestContexts.set(request, wyrly);
    },
    async onResponse({ request }) {
      const wyrly = requestContexts.get(request);
      if (wyrly) await wyrly.dispose();
    },
  };
}

export function createYogaServer(container: Container) {
  const resolvers = {
    Query: {
      user: async (
        _parent: unknown,
        args: { id: string },
        ctx: YogaContext,
      ) => {
        const loader = ctx.wyrly.di.resolve(UserLoaderToken);
        return await loader.load(args.id);
      },
      users: async (
        _parent: unknown,
        args: { ids: string[] },
        ctx: YogaContext,
      ) => {
        const loader = ctx.wyrly.di.resolve(UserLoaderToken);
        return await Promise.all(args.ids.map((id) => loader.load(id)));
      },
    },
  };

  return createYoga<YogaContext>({
    schema: createSchema({ typeDefs, resolvers }),
    plugins: [wyrlyDIPlugin(container)],
    context: ({ request }) => {
      const wyrly = requestContexts.get(request);
      if (!wyrly) {
        throw new Error("Wyrly DI context missing — ensure wyrlyDIPlugin is registered");
      }
      return { wyrly };
    },
  });
}
