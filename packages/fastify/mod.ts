/**
 * Request-scoped dependency injection for Fastify 5 without `reflect-metadata`.
 *
 * Use `diPlugin()` and `getDI(request)` to create one explicit Wyrly DI scope per HTTP request
 * and dispose it when the response ends.
 *
 * @example
 * ```ts
 * import Fastify from "fastify";
 * import { diPlugin, getDI } from "@wyrly/fastify";
 * import { createContainer } from "@wyrly/core";
 *
 * const container = createContainer();
 * const app = Fastify();
 *
 * await app.register(diPlugin(container));
 *
 * app.get("/users/:id", async (request) => {
 *   const di = getDI(request);
 *   return { ok: di.isDisposed() === false };
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
export { diPlugin } from "./plugin.ts";
export { FastifyReplyToken, FastifyRequestToken } from "./tokens.ts";
export {
  asFastifyRequestWithDI,
  type FastifyDIOptions,
  type FastifyRequestWithDI,
  getDI,
} from "./types.ts";
