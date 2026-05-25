/**
 * Request-scoped dependency injection for Fresh 2.x and Deno (JSR only).
 *
 * Use `di()` middleware and `withDI` route handlers to create explicit Wyrly DI scopes without
 * `reflect-metadata` or global mutable containers.
 *
 * @example
 * ```ts
 * import { withDI } from "@wyrly/fresh";
 * import { createContainer } from "@wyrly/core";
 *
 * const container = createContainer();
 *
 * export const GET = withDI(container, async (ctx) => {
 *   const usecase = ctx.di.resolve(MyUseCase);
 *   return Response.json(await usecase.run());
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
export type { Context, HandlerFn, Middleware } from "fresh";
export { di } from "./middleware.ts";
export { withDI } from "./with_di.ts";
export { FreshContextToken, RequestToken } from "./tokens.ts";
export type { FreshDIContext, FreshDIHandler, FreshDIOptions, FreshDIState } from "./types.ts";
