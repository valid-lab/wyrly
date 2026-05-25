/**
 * Request-scoped dependency injection for Express and modern TypeScript.
 *
 * Use `diMiddleware` to create one explicit Wyrly DI scope per HTTP request without
 * `reflect-metadata` or parameter decorators.
 *
 * @example
 * ```ts
 * import express from "express";
 * import { asExpressRequestWithDI, diMiddleware } from "@wyrly/express";
 * import { createContainer } from "@wyrly/core";
 *
 * const app = express();
 * const container = createContainer();
 * app.use(diMiddleware(container));
 *
 * app.get("/users/:id", (req, res) => {
 *   const di = asExpressRequestWithDI(req).di;
 *   res.json({ ok: true });
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
export { diMiddleware } from "./middleware.ts";
export { ExpressRequestToken, ExpressResponseToken } from "./tokens.ts";
export {
  asExpressRequestWithDI,
  type ExpressDIOptions,
  type ExpressRequestWithDI,
} from "./types.ts";
