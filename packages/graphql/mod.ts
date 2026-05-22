/**
 * GraphQL adapter for Wyrly DI — one scope per GraphQL request via `createGraphQLDIContext`.
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
