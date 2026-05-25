import type { CreateGraphQLDIContextOptions, GraphQLDIContext } from "@wyrly/graphql";

/** DI context for a GraphQL Yoga request (alias of {@link GraphQLDIContext}). */
export type YogaDIContext = GraphQLDIContext;

/** Options for {@link createYogaDIContext}. */
export interface CreateYogaDIContextOptions extends
  Omit<
    CreateGraphQLDIContextOptions,
    "request"
  > {
  /** Incoming Web API request (required for Yoga). */
  request: Request;
}

/**
 * Envelop-compatible plugin shape returned by {@link yogaDIPlugin}.
 * Satisfies GraphQL Yoga `plugins` without exposing graphql-yoga's internal `Plugin` type.
 */
export type YogaDIPlugin = {
  onRequest?(params: { request: Request }): void | Promise<void>;
  onResponse?(params: { request: Request }): void | Promise<void>;
};

/** Options for {@link yogaDIPlugin}. */
export interface YogaDIPluginOptions {
  /** Optional response object passed to {@link createGraphQLDIContext}. */
  response?: Response;
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: register `CurrentUserToken` from request headers.
   */
  configureScope?: CreateGraphQLDIContextOptions["configureScope"];
  /** Called when request-scope disposal fails after the GraphQL response ends. */
  onDisposeError?: (error: unknown, request: Request) => void | Promise<void>;
}

/** GraphQL Yoga server context shape when using {@link yogaDIPlugin} + {@link yogaContext}. */
export interface YogaServerContext {
  /** Request-scoped Wyrly DI context. Use `ctx.wyrly.di.resolve(...)` in resolvers. */
  wyrly: YogaDIContext;
}
