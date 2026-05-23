/**
 * Request-scoped dependency injection for GraphQL and DataLoader-style resolver patterns.
 *
 * Use `createGraphQLDIContext` to give each GraphQL request one explicit Wyrly DI scope without
 * `reflect-metadata` or global loader caches.
 *
 * @example
 * ```ts
 * import { createGraphQLDIContext } from "@wyrly/graphql";
 * import { createContainer } from "@wyrly/core";
 *
 * const container = createContainer();
 *
 * const context = async ({ req, res }: { req: Request; res: Response }) =>
 *   createGraphQLDIContext(container, { request: req, response: res });
 *
 * // resolvers use ctx.di.resolve(...)
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
  Token,
  ValidateOptions,
  ValidationIssue,
  ValidationResult,
  ValueProvider,
} from "@wyrly/core";
export { createGraphQLDIContext } from "./context.ts";
export { GraphQLRequestToken, GraphQLResponseToken } from "./tokens.ts";
export type { CreateGraphQLDIContextOptions, GraphQLDIContext } from "./types.ts";
