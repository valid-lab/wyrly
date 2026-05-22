/**
 * Hono adapter for Wyrly DI — request scope via `di()` middleware and `getDI(c)`.
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { di, getDI, type HonoDIVariables } from "@wyrly/hono";
 * import { createContainer } from "@wyrly/core";
 *
 * const app = new Hono<{ Variables: HonoDIVariables }>();
 * app.use(di(createContainer()));
 *
 * app.get("/users/:id", (c) => {
 *   const scope = getDI(c);
 *   return c.json({ disposed: scope.isDisposed() });
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
export type { HonoContext, HonoMiddlewareHandler } from "./public_types.ts";
export { di } from "./middleware.ts";
export { HonoContextToken, RequestToken } from "./tokens.ts";
export { diVariableKey, getDI, type HonoDIVariables } from "./types.ts";
