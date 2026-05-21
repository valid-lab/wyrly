import type { Scope } from "@wyrly/core";

/** DI context for a GraphQL request (the `di` portion of resolver `ctx`) */
export interface GraphQLDIContext {
  di: Scope;
  dispose(): Promise<void>;
}

export interface CreateGraphQLDIContextOptions {
  request?: Request;
  response?: Response;
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: register `CurrentUserToken` or a scoped DataLoader factory.
   */
  configureScope?: (scope: Scope) => void | Promise<void>;
}
