/**
 * Fresh 2.x adapter for Wyrly DI — `di()` middleware and `withDI` route handlers (JSR only).
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
