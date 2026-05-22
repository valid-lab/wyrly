import type { Scope } from "@wyrly/core";

/** DI context for a GraphQL request (the `di` portion of resolver `ctx`). */
export interface GraphQLDIContext {
  /** Request-scoped DI container. */
  di: Scope;
  /** Disposes the scope when the GraphQL request ends. */
  dispose(): Promise<void>;
}

/** Options for {@link createGraphQLDIContext}. */
export interface CreateGraphQLDIContextOptions {
  /** Incoming Web API request (optional). */
  request?: Request;
  /** Outgoing Web API response (optional). */
  response?: Response;
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: register `CurrentUserToken` or a scoped DataLoader factory.
   */
  configureScope?: (scope: Scope) => void | Promise<void>;
}
