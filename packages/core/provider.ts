import type { Scope } from "./scope.ts";
import type { ClassToken } from "./token.ts";
import type { InjectionToken } from "./token.ts";
import type { Lifetime } from "./lifetime.ts";
import { getInjectableMetadata } from "./metadata.ts";
import { graphNodeId, tokenLabel } from "./internal_keys.ts";
import { InvalidProviderError } from "./errors.ts";

/** Registration shape accepted by {@link Container.register}. */
export type Provider<T> =
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

/** Registers a class constructor as the implementation. */
export interface ClassProvider<T> {
  /** Class to instantiate. */
  useClass: ClassToken<T>;
  /** Explicit constructor dependencies (overrides `@Injectable` metadata). */
  deps?: InjectionToken<unknown>[];
  /** Lifetime override (overrides `@Injectable` metadata). */
  lifetime?: Lifetime;
}

/** Registers a constant value (singleton only). */
export interface ValueProvider<T> {
  /** Pre-built instance. */
  useValue: T;
  /** Must be `"singleton"` when set. */
  lifetime?: "singleton";
}

/**
 * Registers a factory function (synchronous only in v1).
 * `Promise<T>` is planned for a future `resolveAsync`.
 */
export interface FactoryProvider<T> {
  /** Factory invoked with the active scope. */
  useFactory: (scope: Scope) => T;
  /** Tokens resolved before the factory runs. */
  deps?: InjectionToken<unknown>[];
  /** Lifetime for the factory result. */
  lifetime?: Lifetime;
}

/** Aliases another registered token. */
export interface ExistingProvider<T> {
  /** Token to resolve instead. */
  useExisting: InjectionToken<T>;
  /** Lifetime for this alias registration. */
  lifetime?: Lifetime;
}

/** Normalized provider kind stored in the registry. */
export type ProviderType = "class" | "value" | "factory" | "existing";

/** Container-internal representation (normalized after registration). */
export interface NormalizedProvider<T = unknown> {
  /** Token this provider satisfies. */
  readonly token: InjectionToken<T>;
  /** Provider kind after normalization. */
  readonly providerType: ProviderType;
  /** Declared dependency tokens. */
  readonly deps: readonly InjectionToken<unknown>[];
  /** Effective lifetime. */
  readonly lifetime: Lifetime;
  /** Label used in graphs and errors. */
  readonly displayName: string;
  /** Set when `providerType` is `"class"`. */
  readonly useClass?: ClassToken<T>;
  /** Set when `providerType` is `"value"`. */
  readonly useValue?: T;
  /** Set when `providerType` is `"factory"`. */
  readonly useFactory?: (scope: Scope) => T;
  /** Set when `providerType` is `"existing"`. */
  readonly useExisting?: InjectionToken<T>;
}

export function normalizeProvider<T>(
  token: InjectionToken<T>,
  provider: Provider<T>,
): NormalizedProvider<T> {
  if ("useValue" in provider) {
    const lt = provider.lifetime ?? "singleton";
    if (lt !== "singleton") {
      throw new InvalidProviderError("useValue lifetime must be singleton only.");
    }
    return {
      token,
      providerType: "value",
      deps: [],
      lifetime: "singleton",
      displayName: tokenLabel(token),
      useValue: provider.useValue,
    };
  }

  if ("useFactory" in provider) {
    const deps = provider.deps ?? [];
    const lifetime = provider.lifetime ?? "singleton";
    return {
      token,
      providerType: "factory",
      deps,
      lifetime,
      displayName: tokenLabel(token),
      useFactory: provider.useFactory,
    };
  }

  if ("useExisting" in provider) {
    const lifetime = provider.lifetime ?? "singleton";
    return {
      token,
      providerType: "existing",
      deps: [provider.useExisting as InjectionToken<unknown>],
      lifetime,
      displayName: tokenLabel(token),
      useExisting: provider.useExisting,
    };
  }

  if ("useClass" in provider) {
    const meta = getInjectableMetadata(provider.useClass);
    const deps = provider.deps ?? meta?.deps ?? [];
    const lifetime = provider.lifetime ?? meta?.lifetime ?? "singleton";
    return {
      token,
      providerType: "class",
      deps,
      lifetime,
      displayName: graphNodeId(provider.useClass as InjectionToken<unknown>),
      useClass: provider.useClass,
    };
  }

  throw new InvalidProviderError("Unknown provider shape.");
}

export function syntheticClassProvider<T>(
  token: ClassToken<T>,
): NormalizedProvider<T> {
  const meta = getInjectableMetadata(token);
  const deps = meta?.deps ?? [];
  const lifetime = meta?.lifetime ?? "singleton";
  return {
    token,
    providerType: "class",
    deps,
    lifetime,
    displayName: graphNodeId(token as InjectionToken<unknown>),
    useClass: token,
  };
}
