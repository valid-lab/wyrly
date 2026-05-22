/**
 * Next.js 15+ adapter for Wyrly DI — route handlers (`withDI`) and Server Components (`createServerDI`).
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
