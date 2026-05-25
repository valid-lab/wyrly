/**
 * Type-safe dependency injection for modern TypeScript without `reflect-metadata`.
 *
 * Wyrly DI uses typed tokens, explicit dependencies, standard decorators, request scopes, and an
 * inspectable graph instead of legacy decorator metadata or parameter decorators.
 *
 * @example
 * ```ts
 * import { createContainer, Injectable, token } from "@wyrly/core";
 *
 * const RepoToken = token<{ findById(id: string): Promise<unknown> }>("Repo");
 *
 * @Injectable({ deps: [RepoToken], lifetime: "scoped" })
 * class GetUser {
 *   constructor(private readonly repo: { findById(id: string): Promise<unknown> }) {}
 * }
 *
 * const container = createContainer();
 * container.register(RepoToken, { useValue: { findById: async () => null }, lifetime: "scoped" });
 * container.register(GetUser);
 *
 * const scope = container.createScope();
 * try {
 *   scope.resolve(GetUser);
 * } finally {
 *   await scope.dispose();
 * }
 * ```
 *
 * @module
 */
export { type ClassToken, type InjectionToken, type Token, token } from "./token.ts";
export type { Lifetime } from "./lifetime.ts";
export { Injectable } from "./decorators.ts";
export type { InjectableMetadata } from "./metadata.ts";
export type { ClassDecoratorContext } from "./types_decorator.ts";
export { type Container, createContainer } from "./container.ts";
export type { Scope, ScopeDisposeOptions } from "./scope.ts";
export type {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  NormalizedProvider,
  Provider,
  ProviderType,
  ValueProvider,
} from "./provider.ts";
export type { DependencyEdge, DependencyGraph, DependencyNode } from "./graph.ts";
export { graphToDot, graphToJson, graphToMermaid } from "./graph_format.ts";
export type { GraphToJsonOptions } from "./graph_format.ts";
export type { ValidateOptions, ValidationIssue, ValidationResult } from "./validate.ts";
export { validateNormalizedProviders } from "./validate.ts";
export {
  DEFAULT_LOCALE,
  errorMessage,
  type ErrorMessageKind,
  lifetimeViolationHint,
  type Locale,
  normalizeLocaleTag,
  providerNotFoundHint,
  resolveLocale,
  validationMessage,
  type ValidationMessageCode,
} from "./i18n.ts";
export {
  CircularDependencyError,
  DuplicateProviderError,
  type ErrorLocaleOptions,
  InvalidProviderError,
  LifetimeViolationError,
  ProviderNotFoundError,
  type ResolutionPath,
  ScopeDisposedError,
  ScopeHasActiveChildrenError,
} from "./errors.ts";
