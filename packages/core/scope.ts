import type { Provider } from "./provider.ts";
import type { InjectionToken } from "./token.ts";

/** Options for {@link Scope.dispose}. */
export interface ScopeDisposeOptions {
  /** Called when a disposer throws or rejects. Other disposers still run. */
  onError?: (error: unknown) => void;
}

/** Request or nested DI scope; resolves scoped and transient providers. */
export interface Scope {
  /** Resolves a provider from this scope (or parent container). */
  resolve<T>(token: InjectionToken<T>): T;
  /** Registers a provider local to this scope. */
  register<T>(token: InjectionToken<T>, provider: Provider<T>): void;
  /** Sets a pre-built instance for a token in this scope. */
  set<T>(token: InjectionToken<T>, value: T): void;
  /**
   * Creates a child scope that can read parent scoped instances and local values.
   * Disposing this scope while children are active throws {@link ScopeHasActiveChildrenError}.
   */
  createChildScope(): Scope;
  /** Disposes scoped instances and runs registered disposers. */
  dispose(options?: ScopeDisposeOptions): Promise<void>;
  /**
   * Synchronous dispose when no async disposers are registered.
   * Prefer this on hot paths (e.g. per-request teardown without I/O disposers).
   */
  disposeSync(options?: ScopeDisposeOptions): void;
  /** Whether {@link dispose} has already been called. */
  isDisposed(): boolean;
}
