import type { Container } from "@wyrly/core";
import type { CreateGraphQLDIContextOptions, GraphQLDIContext } from "./types.ts";
import { GraphQLRequestToken, GraphQLResponseToken } from "./tokens.ts";

/**
 * Creates a DI scope per GraphQL request.
 * Use `ctx.di.resolve(...)` from resolvers and call `ctx.dispose()` when the request ends.
 *
 * In the domain layer, avoid injecting `GraphQLRequestToken` directly;
 * map it to port tokens (e.g. `CurrentUserToken`) via `configureScope` in the composition root.
 *
 * Register DataLoaders on the container as `lifetime: "scoped"` factories and
 * share them within one scope per GraphQL request (product spec §14.3).
 */
export async function createGraphQLDIContext(
  container: Container,
  options: CreateGraphQLDIContextOptions = {},
): Promise<GraphQLDIContext> {
  const scope = container.createScope();
  if (options.request !== undefined) {
    scope.set(GraphQLRequestToken, options.request);
  }
  if (options.response !== undefined) {
    scope.set(GraphQLResponseToken, options.response);
  }
  if (options.configureScope) {
    await options.configureScope(scope);
  }
  return {
    di: scope,
    dispose: () => scope.dispose(),
  };
}
