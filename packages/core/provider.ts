import type { Scope } from "./scope.ts";
import type { ClassToken } from "./token.ts";
import type { InjectionToken } from "./token.ts";
import type { Lifetime } from "./lifetime.ts";
import { getInjectableMetadata } from "./metadata.ts";
import { graphNodeId, registryKey, tokenLabel } from "./internal_keys.ts";
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
  /** Factory invoked with the active scope and resolved dependency values. */
  useFactory: (scope: Scope, ...deps: unknown[]) => T;
  /** Tokens resolved before the factory runs and passed to `useFactory`. */
  deps: InjectionToken<unknown>[];
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
  /** Registry map key (computed once at registration). */
  readonly key: symbol | ClassToken<unknown>;
  /** Provider kind after normalization. */
  readonly providerType: ProviderType;
  /** Declared dependency tokens. */
  readonly deps: readonly InjectionToken<unknown>[];
  /** Effective lifetime. */
  readonly lifetime: Lifetime;
  /** Label used in graphs and errors (materialized on first read via {@link ensureProviderDisplayName}). */
  readonly displayName?: string;
  /** Set when `providerType` is `"class"`. */
  readonly useClass?: ClassToken<T>;
  /** Set when `providerType` is `"value"`. */
  readonly useValue?: T;
  /** Set when `providerType` is `"factory"`. */
  readonly useFactory?: (scope: Scope, ...deps: unknown[]) => T;
  /** Set when `providerType` is `"existing"`. */
  readonly useExisting?: InjectionToken<T>;
}

const EMPTY_DEPS: readonly InjectionToken<unknown>[] = [];

/** Lazily attaches {@link NormalizedProvider.displayName} (inspect / tooling only). */
export function ensureProviderDisplayName(np: NormalizedProvider): string {
  const record = np as NormalizedProvider & { displayName?: string };
  if (record.displayName !== undefined) return record.displayName;
  const name = np.providerType === "class" && np.useClass
    ? graphNodeId(np.useClass as InjectionToken<unknown>)
    : tokenLabel(np.token);
  record.displayName = name;
  return name;
}

export function normalizeProvider<T>(
  token: InjectionToken<T>,
  provider: Provider<T>,
): NormalizedProvider<T> {
  const key = registryKey(token);

  if ("useValue" in provider) {
    const lt = provider.lifetime ?? "singleton";
    if (lt !== "singleton") {
      throw new InvalidProviderError("useValue lifetime must be singleton only.");
    }
    return {
      token,
      key,
      providerType: "value",
      deps: EMPTY_DEPS,
      lifetime: "singleton",
      useValue: provider.useValue,
    } as NormalizedProvider<T>;
  }

  if ("useFactory" in provider) {
    const deps = provider.deps;
    const lifetime = provider.lifetime ?? "singleton";
    return {
      token,
      key,
      providerType: "factory",
      deps,
      lifetime,
      useFactory: provider.useFactory,
    } as NormalizedProvider<T>;
  }

  if ("useExisting" in provider) {
    const lifetime = provider.lifetime ?? "singleton";
    return {
      token,
      key,
      providerType: "existing",
      deps: [provider.useExisting as InjectionToken<unknown>],
      lifetime,
      useExisting: provider.useExisting,
    } as NormalizedProvider<T>;
  }

  if ("useClass" in provider) {
    const explicitDeps = provider.deps;
    const explicitLifetime = provider.lifetime;
    if (explicitDeps !== undefined && explicitLifetime !== undefined) {
      return {
        token,
        key,
        providerType: "class",
        deps: explicitDeps,
        lifetime: explicitLifetime,
        useClass: provider.useClass,
      } as NormalizedProvider<T>;
    }
    if (explicitDeps !== undefined) {
      return {
        token,
        key,
        providerType: "class",
        deps: explicitDeps,
        lifetime: explicitLifetime ?? "singleton",
        useClass: provider.useClass,
      } as NormalizedProvider<T>;
    }
    const meta = getInjectableMetadata(provider.useClass);
    const deps = meta?.deps ?? [];
    const lifetime = explicitLifetime ?? meta?.lifetime ?? "singleton";
    return {
      token,
      key,
      providerType: "class",
      deps,
      lifetime,
      useClass: provider.useClass,
    } as NormalizedProvider<T>;
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
    key: registryKey(token),
    providerType: "class",
    deps,
    lifetime,
    useClass: token,
  } as NormalizedProvider<T>;
}
