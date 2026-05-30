import type { InjectionToken } from "./token.ts";
import type { Provider } from "./provider.ts";
import type { Scope } from "./scope.ts";
import type { DependencyGraph } from "./graph.ts";
import type { ValidateOptions, ValidationResult } from "./validate.ts";
import { ContainerImpl } from "./container_impl.ts";

/** Root DI container: registrations, root resolve, scopes, inspect, and validate. */
export interface Container {
  /** Registers a provider (or `@Injectable` class when `provider` is omitted). */
  register<T>(token: InjectionToken<T>, provider?: Provider<T>): void;
  /** Replaces an existing registration (tests and composition roots). */
  override<T>(token: InjectionToken<T>, provider: Provider<T>): void;
  /** Resolves from the root (singleton / transient only; not scoped). */
  resolve<T>(token: InjectionToken<T>): T;
  /** Creates a child scope (typically one per HTTP / GraphQL request). */
  createScope(): Scope;
  /** Exports the dependency graph for tooling and debugging. */
  inspect(): DependencyGraph;
  /** Runs design-time checks on the provider registry. */
  validate(options?: ValidateOptions): ValidationResult;
  /** Registers multiple providers in one pass (composition roots). */
  registerMany(
    entries: readonly (readonly [InjectionToken<unknown>, Provider<unknown>])[],
  ): void;
}

/** Creates a new root container with an empty provider registry. */
export function createContainer(): Container {
  return new ContainerImpl();
}
