import type { NormalizedProvider } from "./provider.ts";
import { type RegistryKey, registryKey } from "./internal_keys.ts";

/** Register-time compiled provider used on the resolve hot path. */
export interface CompiledProvider {
  readonly np: NormalizedProvider;
  readonly depKeys: readonly RegistryKey[];
}

export function compileProvider(np: NormalizedProvider): CompiledProvider {
  const depKeys = new Array<RegistryKey>(np.deps.length);
  for (let i = 0; i < np.deps.length; i++) {
    depKeys[i] = registryKey(np.deps[i]!);
  }
  return { np, depKeys };
}

/** Dense slot table keyed by registry key (register-time compile). */
export class ResolvePlan {
  readonly #slots: CompiledProvider[] = [];
  readonly #slotIndexByKey = new Map<RegistryKey, number>();

  register(np: NormalizedProvider): void {
    const compiled = compileProvider(np);
    const existing = this.#slotIndexByKey.get(np.key);
    if (existing !== undefined) {
      this.#slots[existing] = compiled;
      return;
    }
    this.#slotIndexByKey.set(np.key, this.#slots.length);
    this.#slots.push(compiled);
  }

  get(key: RegistryKey): CompiledProvider | undefined {
    const index = this.#slotIndexByKey.get(key);
    if (index === undefined) return undefined;
    return this.#slots[index];
  }
}
