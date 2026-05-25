/**
 * Request-scoped dependency injection for GraphQL Yoga 5 without `reflect-metadata`.
 *
 * Use `yogaDIPlugin()` and `yogaContext()` to create one explicit Wyrly DI scope per GraphQL
 * request and dispose it when the response ends.
 *
 * @example
 * ```ts
 * import { createSchema, createYoga } from "graphql-yoga";
 * import { yogaContext, yogaDIPlugin, type YogaServerContext } from "@wyrly/yoga";
 * import { createContainer } from "@wyrly/core";
 *
 * const container = createContainer();
 *
 * const yoga = createYoga<YogaServerContext>({
 *   schema: createSchema({ typeDefs, resolvers }),
 *   plugins: [yogaDIPlugin(container)],
 *   context: yogaContext,
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
export { createYogaDIContext } from "./context.ts";
export { yogaContext, yogaDIPlugin } from "./plugin.ts";
export { GraphQLRequestToken, GraphQLResponseToken } from "./tokens.ts";
export type {
  CreateYogaDIContextOptions,
  YogaDIContext,
  YogaDIPlugin,
  YogaDIPluginOptions,
  YogaServerContext,
} from "./types.ts";
