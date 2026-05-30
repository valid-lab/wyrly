import type { NormalizedProvider } from "./provider.ts";
import { type RegistryKey, registryKey } from "./internal_keys.ts";

/** Shared empty dep key list for zero-dependency providers (register fast path). */
export const EMPTY_DEP_KEYS: readonly RegistryKey[] = [];

/** Shared empty dep slot index list for zero-dependency providers. */
export const EMPTY_DEP_SLOT_INDICES: readonly number[] = [];

/** Provider slot; depKeys / depSlotIndices compiled lazily or at bootstrap finalize. */
export interface CompiledProvider {
  readonly np: NormalizedProvider;
  depKeys?: readonly RegistryKey[];
  depSlotIndices?: readonly number[];
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

function compileDepSlotIndices(
  slot: CompiledProvider,
  plan: ResolvePlan,
): readonly number[] {
  const np = slot.np;
  if (np.deps.length === 0) return EMPTY_DEP_SLOT_INDICES;
  const depKeys = slot.depKeys ?? compileDepKeys(np);
  const indices = new Array<number>(depKeys.length);
  for (let i = 0; i < depKeys.length; i++) {
    const idx = plan.getSlotIndex(depKeys[i]!);
    indices[i] = idx ?? -1;
  }
  return indices;
}

export function ensureDepKeys(slot: CompiledProvider): readonly RegistryKey[] {
  if (slot.depKeys !== undefined) return slot.depKeys;
  const depKeys = compileDepKeys(slot.np);
  slot.depKeys = depKeys;
  return depKeys;
}

export function ensureDepSlotIndices(
  slot: CompiledProvider,
  plan: ResolvePlan,
): readonly number[] {
  if (slot.depSlotIndices !== undefined) return slot.depSlotIndices;
  const indices = compileDepSlotIndices(slot, plan);
  slot.depSlotIndices = indices;
  return indices;
}

/** Compiles dep keys for all slots in one pass (bootstrap finalize or first resolve). */
export function compileAllDepKeys(slots: Iterable<CompiledProvider>): void {
  for (const slot of slots) {
    ensureDepKeys(slot);
  }
}

/** Compiles dep slot indices for all slots in one pass (registerMany finalize). */
export function compileAllDepSlotIndices(plan: ResolvePlan): void {
  for (const slot of plan.iterateSlots()) {
    ensureDepSlotIndices(slot, plan);
  }
}

export function compileProvider(np: NormalizedProvider, slotIndex: number): CompiledProvider {
  const slot: CompiledProvider = {
    np,
    depKeys: np.deps.length === 0 ? EMPTY_DEP_KEYS : compileDepKeys(np),
    slotIndex,
  };
  if (np.deps.length === 0) {
    slot.depSlotIndices = EMPTY_DEP_SLOT_INDICES;
  }
  return slot;
}

/** Single-map provider registry with dense slot-index storage. */
export class ResolvePlan {
  readonly #slots = new Map<RegistryKey, CompiledProvider>();
  readonly #keyToIndex = new Map<RegistryKey, number>();
  #slotsByIndex: CompiledProvider[] = [];
  #nextSlotIndex = 0;

  /** Pre-allocates dense slot storage for batch registration. */
  reserve(capacity: number): void {
    if (capacity > this.#slotsByIndex.length) {
      this.#slotsByIndex.length = capacity;
    }
  }

  register(np: NormalizedProvider): void {
    const existing = this.#keyToIndex.get(np.key);
    const slotIndex = existing ?? this.#nextSlotIndex++;
    const compiled: CompiledProvider = { np, slotIndex };
    if (np.deps.length === 0) {
      compiled.depKeys = EMPTY_DEP_KEYS;
      compiled.depSlotIndices = EMPTY_DEP_SLOT_INDICES;
    }
    this.#slots.set(np.key, compiled);
    if (slotIndex >= this.#slotsByIndex.length) {
      this.#slotsByIndex.length = slotIndex + 1;
    }
    this.#slotsByIndex[slotIndex] = compiled;
    if (existing === undefined) {
      this.#keyToIndex.set(np.key, slotIndex);
    }
  }

  /** Clears lazily compiled dep metadata after registry changes. */
  invalidateCompiledSlots(): void {
    for (const slot of this.#slots.values()) {
      if (slot.np.deps.length === 0) {
        slot.depKeys = EMPTY_DEP_KEYS;
        slot.depSlotIndices = EMPTY_DEP_SLOT_INDICES;
      } else {
        delete slot.depKeys;
        delete slot.depSlotIndices;
      }
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
    const out = new Array<NormalizedProvider<unknown>>(this.#nextSlotIndex);
    for (let i = 0; i < this.#nextSlotIndex; i++) {
      const slot = this.#slotsByIndex[i];
      if (slot) out[i] = slot.np;
    }
    return out;
  }

  *iterateSlots(): IterableIterator<CompiledProvider> {
    for (let i = 0; i < this.#nextSlotIndex; i++) {
      const slot = this.#slotsByIndex[i];
      if (slot) yield slot;
    }
  }

  get slotCount(): number {
    return this.#nextSlotIndex;
  }
}
