import type { NormalizedProvider } from "./provider.ts";
import type { CompiledProvider } from "./resolve_plan.ts";
import { ensureDepKeys } from "./resolve_plan.ts";
import { type RegistryKey } from "./internal_keys.ts";

function isSlotIndexOrderTopo(ordered: readonly CompiledProvider[]): boolean {
  const keyToIndex = new Map<RegistryKey, number>();
  for (let i = 0; i < ordered.length; i++) {
    keyToIndex.set(ordered[i]!.np.key, ordered[i]!.slotIndex);
  }
  for (let i = 0; i < ordered.length; i++) {
    const slot = ordered[i]!;
    const depIndices = slot.depSlotIndices;
    if (depIndices !== undefined) {
      for (let d = 0; d < depIndices.length; d++) {
        const depIdx = depIndices[d]!;
        if (depIdx >= 0 && depIdx >= slot.slotIndex) return false;
      }
    } else {
      const depKeys = ensureDepKeys(slot);
      for (let d = 0; d < depKeys.length; d++) {
        const depIdx = keyToIndex.get(depKeys[d]!);
        if (depIdx !== undefined && depIdx >= slot.slotIndex) return false;
      }
    }
  }
  return true;
}

/** Topologically ordered singleton providers for one-shot root materialization. */
export interface FrozenSingletonPlan {
  readonly ordered: readonly CompiledProvider[];
}

export function buildFrozenSingletonPlan(
  slots: Iterable<CompiledProvider>,
): FrozenSingletonPlan | undefined {
  const list = [...slots];
  if (list.length === 0) return undefined;

  for (const slot of list) {
    if (slot.np.lifetime !== "singleton") return undefined;
  }

  const byIndex = new Array<CompiledProvider>(list.length);
  for (let i = 0; i < list.length; i++) {
    const slot = list[i]!;
    if (slot.slotIndex < 0 || slot.slotIndex >= list.length) {
      return buildFrozenSingletonPlanTopo(list);
    }
    byIndex[slot.slotIndex] = slot;
  }
  if (byIndex.length === list.length && isSlotIndexOrderTopo(byIndex)) {
    return { ordered: byIndex };
  }

  return buildFrozenSingletonPlanTopo(list);
}

function buildFrozenSingletonPlanTopo(
  list: CompiledProvider[],
): FrozenSingletonPlan | undefined {
  const keyToSlot = new Map<RegistryKey, CompiledProvider>();
  for (const slot of list) {
    keyToSlot.set(slot.np.key, slot);
  }

  const inDegree = new Map<RegistryKey, number>();
  const dependents = new Map<RegistryKey, RegistryKey[]>();

  for (const slot of list) {
    if (!inDegree.has(slot.np.key)) inDegree.set(slot.np.key, 0);
    const depKeys = ensureDepKeys(slot);
    for (const depKey of depKeys) {
      if (!keyToSlot.has(depKey)) continue;
      inDegree.set(slot.np.key, (inDegree.get(slot.np.key) ?? 0) + 1);
      const arr = dependents.get(depKey) ?? [];
      arr.push(slot.np.key);
      dependents.set(depKey, arr);
    }
  }

  const queue: RegistryKey[] = [];
  for (const slot of list) {
    if ((inDegree.get(slot.np.key) ?? 0) === 0) queue.push(slot.np.key);
  }

  const ordered: CompiledProvider[] = [];
  while (queue.length > 0) {
    const key = queue.shift()!;
    const slot = keyToSlot.get(key);
    if (!slot) continue;
    ordered.push(slot);
    for (const next of dependents.get(key) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  if (ordered.length !== list.length) return undefined;

  return { ordered };
}

export function allProvidersSingleton(slots: Iterable<{ np: NormalizedProvider }>): boolean {
  let any = false;
  for (const slot of slots) {
    any = true;
    if (slot.np.lifetime !== "singleton") return false;
  }
  return any;
}
