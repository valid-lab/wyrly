import { InvalidProviderError } from "./errors.ts";
import type { RegistryKey } from "./internal_keys.ts";
import type { NormalizedProvider } from "./provider.ts";
import type { Scope } from "./scope.ts";

/** How to read dependency values when materializing a provider (hot-path friendly object). */
export interface DepResolver {
  resolveExisting(): unknown;
  resolveArgs(): unknown[];
}

export function createInstanceFromSlot<T>(
  scope: Scope,
  np: NormalizedProvider<T>,
  deps: DepResolver,
): T {
  switch (np.providerType) {
    case "value":
      return np.useValue as T;

    case "existing":
      return deps.resolveExisting() as T;

    case "factory":
      return np.useFactory!(scope, ...deps.resolveArgs()) as T;

    case "class": {
      const Ctor = np.useClass!;
      const args = deps.resolveArgs() as never[];
      return new (Ctor as new (...args: never[]) => T)(...args);
    }

    default:
      throw new InvalidProviderError("InvalidProvider_unsupported_provider_type", {
        providerType: String(np.providerType),
      });
  }
}

export function singletonCacheDepResolver(
  depKeys: readonly RegistryKey[],
  getFromCache: (key: RegistryKey) => unknown,
): DepResolver {
  return {
    resolveExisting(): unknown {
      return getFromCache(depKeys[0]!);
    },
    resolveArgs(): unknown[] {
      return depKeys.map((depKey) => getFromCache(depKey));
    },
  };
}

export function scopedSlotDepResolver(
  depIndices: readonly number[],
  values: unknown[],
): DepResolver {
  return {
    resolveExisting(): unknown {
      const exIdx = depIndices[0]!;
      return exIdx >= 0 ? values[exIdx] : undefined;
    },
    resolveArgs(): unknown[] {
      const args = new Array<unknown>(depIndices.length);
      for (let i = 0; i < depIndices.length; i++) {
        const idx = depIndices[i]!;
        args[i] = idx >= 0 ? values[idx] : undefined;
      }
      return args;
    },
  };
}

export function dynamicDepResolver(
  depKeys: readonly RegistryKey[],
  resolveDepByKey: (depKey: RegistryKey) => unknown,
): DepResolver {
  return {
    resolveExisting(): unknown {
      return resolveDepByKey(depKeys[0]!);
    },
    resolveArgs(): unknown[] {
      return depKeys.map((depKey) => resolveDepByKey(depKey));
    },
  };
}
