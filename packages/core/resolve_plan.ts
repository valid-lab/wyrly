import type { NormalizedProvider } from "./provider.ts";
import { type RegistryKey, registryKey } from "./internal_keys.ts";

/** Shared empty dep key list for zero-dependency providers (register fast path). */
export const EMPTY_DEP_KEYS: readonly RegistryKey[] = [];

/** Provider slot; depKeys compiled lazily on first resolve when non-empty. */
export interface CompiledProvider {
  readonly np: NormalizedProvider;
  depKeys?: readonly RegistryKey[];
  /** Dense index for scoped cache arrays (assigned at register). */
  slotIndex: number;
}

function compileDepKeys(np: NormalizedProvider): readonly RegistryKey[] {
  if (np.deps.length === 0) return EMPTY_DEP_KEYS;
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

export function compileProvider(np: NormalizedProvider, slotIndex: number): CompiledProvider {
  return {
    np,
    depKeys: np.deps.length === 0 ? EMPTY_DEP_KEYS : compileDepKeys(np),
    slotIndex,
  };
}

/** Single-map provider registry with hybrid dep-key compilation. */
export class ResolvePlan {
  readonly #slots = new Map<RegistryKey, CompiledProvider>();
  readonly #keyToIndex = new Map<RegistryKey, number>();
  #nextSlotIndex = 0;

  register(np: NormalizedProvider): void {
    const existing = this.#keyToIndex.get(np.key);
    const slotIndex = existing ?? this.#nextSlotIndex++;
    const compiled: CompiledProvider = { np, slotIndex };
    if (np.deps.length === 0) {
      compiled.depKeys = EMPTY_DEP_KEYS;
    }
    this.#slots.set(np.key, compiled);
    if (existing === undefined) {
      this.#keyToIndex.set(np.key, slotIndex);
    }
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

  getSlotIndex(key: RegistryKey): number | undefined {
    return this.#keyToIndex.get(key);
  }

  registeredProviders(): NormalizedProvider<unknown>[] {
    const out = new Array<NormalizedProvider<unknown>>(this.#slots.size);
    for (const slot of this.#slots.values()) {
      out[slot.slotIndex] = slot.np;
    }
    return out;
  }

  iterateSlots(): IterableIterator<CompiledProvider> {
    return this.#slots.values();
  }

  get slotCount(): number {
    return this.#nextSlotIndex;
  }
}
