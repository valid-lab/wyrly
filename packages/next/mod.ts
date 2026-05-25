/**
 * Request-scoped dependency injection for Next.js 15+ App Router without `reflect-metadata`.
 *
 * Use route handlers (`withDI`), Server Actions (`withActionDI`), and Server Components
 * (`createServerDI`) with the same explicit Wyrly DI composition root.
 *
 * @example
 * ```ts
 * import { withDI } from "@wyrly/next";
 * import { createContainer } from "@wyrly/core";
 *
 * const container = createContainer();
 *
 * export const GET = withDI(container, async (_req, { di }) => {
 *   const usecase = di.resolve(MyUseCase);
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
export { withDI } from "./with_di.ts";
export { withActionDI } from "./with_action_di.ts";
export { createServerDI } from "./server_di.ts";
export type { NextRequest } from "./public_types.ts";
export { NextRequestToken } from "./tokens.ts";
export type {
  AfterScheduler,
  CreateServerDIOptions,
  RouteHandlerContext,
  WithDIOptions,
} from "./types.ts";
