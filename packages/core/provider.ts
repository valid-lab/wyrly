import type { Scope } from "./scope.ts";
import type { ClassToken } from "./token.ts";
import type { InjectionToken } from "./token.ts";
import type { Lifetime } from "./lifetime.ts";
import { getInjectableMetadata } from "./metadata.ts";
import { graphNodeId, tokenLabel } from "./internal_keys.ts";
import { InvalidProviderError } from "./errors.ts";

export type Provider<T> =
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

export interface ClassProvider<T> {
  useClass: ClassToken<T>;
  deps?: InjectionToken<unknown>[];
  lifetime?: Lifetime;
}

export interface ValueProvider<T> {
  useValue: T;
  lifetime?: "singleton";
}

/**
 * MVP supports synchronous factories only. `Promise<T>` is planned for a future `resolveAsync`.
 */
export interface FactoryProvider<T> {
  useFactory: (scope: Scope) => T;
  deps?: InjectionToken<unknown>[];
  lifetime?: Lifetime;
}

export interface ExistingProvider<T> {
  useExisting: InjectionToken<T>;
  lifetime?: Lifetime;
}

export type ProviderType = "class" | "value" | "factory" | "existing";

/** Container-internal representation (normalized after registration) */
export interface NormalizedProvider<T = unknown> {
  readonly token: InjectionToken<T>;
  readonly providerType: ProviderType;
  readonly deps: readonly InjectionToken<unknown>[];
  readonly lifetime: Lifetime;
  readonly displayName: string;
  readonly useClass?: ClassToken<T>;
  readonly useValue?: T;
  readonly useFactory?: (scope: Scope) => T;
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
