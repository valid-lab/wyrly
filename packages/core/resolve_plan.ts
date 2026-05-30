import type { NormalizedProvider } from "./provider.ts";
import { type RegistryKey, registryKey } from "./internal_keys.ts";

/** Provider slot; depKeys are compiled on first resolve (lazy). */
export interface CompiledProvider {
  readonly np: NormalizedProvider;
  depKeys?: readonly RegistryKey[];
}

function compileDepKeys(np: NormalizedProvider): readonly RegistryKey[] {
  const depKeys = new Array<RegistryKey>(np.deps.length);
  for (let i = 0; i < np.deps.length; i++) {
    depKeys[i] = registryKey(np.deps[i]!);
  }
  return depKeys;
}

export function ensureDepKeys(slot: CompiledProvider): readonly RegistryKey[] {
  if (slot.depKeys !== undefined) return slot.depKeys;
  const depKeys = compileDepKeys(slot.np);
  slot.depKeys = depKeys;
  return depKeys;
}

export function compileProvider(np: NormalizedProvider): CompiledProvider {
  return { np, depKeys: compileDepKeys(np) };
}

/** Single-map provider registry with lazy dep-key compilation. */
export class ResolvePlan {
  readonly #slots = new Map<RegistryKey, CompiledProvider>();

  register(np: NormalizedProvider): void {
    this.#slots.set(np.key, { np });
  }

  has(key: RegistryKey): boolean {
    return this.#slots.has(key);
  }

  /** Returns a slot without compiling depKeys (register / ultra-fast paths). */
  peek(key: RegistryKey): CompiledProvider | undefined {
    return this.#slots.get(key);
  }

  get(key: RegistryKey): CompiledProvider | undefined {
    const slot = this.#slots.get(key);
    if (slot === undefined) return undefined;
    ensureDepKeys(slot);
    return slot;
  }

  registeredProviders(): NormalizedProvider<unknown>[] {
    const out = new Array<NormalizedProvider<unknown>>(this.#slots.size);
    let i = 0;
    for (const slot of this.#slots.values()) {
      out[i++] = slot.np;
    }
    return out;
  }
}
