/**
 * Request-scoped dependency injection for Apollo Server 4+ and TypeScript.
 *
 * Use `apolloDIPlugin()` to create one explicit Wyrly DI scope per GraphQL operation without
 * `reflect-metadata`. Disposes the scope in `willSendResponse`.
 *
 * @example
 * ```ts
 * import { ApolloServer } from "@apollo/server";
 * import { apolloDIPlugin, type ApolloServerContext } from "@wyrly/apollo";
 * import { createContainer } from "@wyrly/core";
 *
 * const container = createContainer();
 *
 * const server = new ApolloServer<ApolloServerContext>({
 *   typeDefs,
 *   resolvers,
 *   plugins: [apolloDIPlugin(container)],
 * });
 * ```
 *
 * @module
 */
export type {
  ClassProvider,
  ClassToken,
  Container,
  DependencyEdge,
  DependencyGraph,
  DependencyNode,
  ExistingProvider,
  FactoryProvider,
  InjectionToken,
  Lifetime,
  Locale,
  Provider,
  ProviderType,
  Scope,
  ScopeDisposeOptions,
  Token,
  ValidateOptions,
  ValidationIssue,
  ValidationResult,
  ValueProvider,
} from "@wyrly/core";
export type { CreateGraphQLDIContextOptions, GraphQLDIContext } from "@wyrly/graphql";
export { createApolloDIContext } from "./context.ts";
export { apolloDIPlugin } from "./plugin.ts";
export {
  ApolloRequestToken,
  ApolloResponseToken,
  GraphQLRequestToken,
  GraphQLResponseToken,
} from "./tokens.ts";
export { requestFromApolloGraphQLRequest, toFetchRequest } from "./request.ts";
export type {
  ApolloDIContext,
  ApolloDIPluginOptions,
  ApolloDIRequestListener,
  ApolloDIServerPlugin,
  ApolloGraphQLHttpMetadata,
  ApolloHTTPRequestLike,
  ApolloHTTPResponseLike,
  ApolloServerContext,
  CreateApolloDIContextOptions,
} from "./types.ts";
