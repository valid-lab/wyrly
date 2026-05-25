import type { CreateGraphQLDIContextOptions, GraphQLDIContext } from "@wyrly/graphql";
import type {
  ApolloGraphQLHttpMetadata,
  ApolloHTTPRequestLike,
  ApolloHTTPResponseLike,
} from "./request.ts";

/** DI context for an Apollo Server GraphQL request (alias of {@link GraphQLDIContext}). */
export type ApolloDIContext = GraphQLDIContext;

/** Options for {@link createApolloDIContext}. */
export interface CreateApolloDIContextOptions {
  /**
   * Web API `Request` for this GraphQL operation (recommended).
   * When omitted, {@link apolloHttp} must provide `req` (converted via {@link toFetchRequest}).
   */
  request?: Request;
  /** Optional Web API `Response`. */
  response?: Response;
  /**
   * Node HTTP `req` / `res` for Apollo on Express and similar.
   * Do not inject these tokens into domain code — map to port tokens in `configureScope`.
   */
  apolloHttp?: { req: ApolloHTTPRequestLike; res?: ApolloHTTPResponseLike };
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: register `CurrentUserToken` from request headers.
   */
  configureScope?: CreateGraphQLDIContextOptions["configureScope"];
}

/** Options for {@link apolloDIPlugin}. */
export interface ApolloDIPluginOptions {
  /** Base URL when building a `Request` from Apollo's HTTP metadata (default `/graphql` on localhost). */
  baseUrl?: string;
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: register `CurrentUserToken` from headers.
   */
  configureScope?: CreateGraphQLDIContextOptions["configureScope"];
  /** Called when request-scope disposal fails after `willSendResponse`. */
  onDisposeError?: (error: unknown, request: Request) => void | Promise<void>;
}

/** Apollo Server context extension when using {@link apolloDIPlugin}. */
export interface ApolloServerContext {
  /**
   * Request-scoped Wyrly DI context (set by {@link apolloDIPlugin} before resolvers run).
   * Use `ctx.wyrly!.di.resolve(...)` in resolvers.
   */
  wyrly?: ApolloDIContext;
}

/**
 * Structural plugin type for Apollo Server 4+ `plugins` arrays.
 * Avoids referencing non-exported types from `@apollo/server` in public docs.
 */
export type ApolloDIServerPlugin<TContext extends object = object> = {
  requestDidStart?(
    requestContext: {
      contextValue: TContext;
      request: { http?: ApolloGraphQLHttpMetadata };
    },
  ): Promise<ApolloDIRequestListener | void>;
};

/** Listener returned from {@link ApolloDIServerPlugin.requestDidStart}. */
export type ApolloDIRequestListener = {
  willSendResponse?(
    requestContext: { contextValue: ApolloServerContext },
  ): Promise<void>;
};

export type { ApolloGraphQLHttpMetadata, ApolloHTTPRequestLike, ApolloHTTPResponseLike };
