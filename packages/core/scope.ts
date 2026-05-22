import type { Provider } from "./provider.ts";
import type { InjectionToken } from "./token.ts";

/** Request or nested DI scope; resolves scoped and transient providers. */
export interface Scope {
  /** Resolves a provider from this scope (or parent container). */
  resolve<T>(token: InjectionToken<T>): T;
  /** Registers a provider local to this scope. */
  register<T>(token: InjectionToken<T>, provider: Provider<T>): void;
  /** Sets a pre-built instance for a token in this scope. */
  set<T>(token: InjectionToken<T>, value: T): void;
  /** Disposes scoped instances and runs registered disposers. */
  dispose(): Promise<void>;
  /** Whether {@link dispose} has already been called. */
  isDisposed(): boolean;
}
