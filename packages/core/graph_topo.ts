import type { RegistryKey } from "./internal_keys.ts";
import type { CompiledProvider } from "./resolve_plan.ts";

/** Kahn topological sort over in-registry dependency edges; undefined if cyclic. */
export function topoSortSlots(
  list: readonly CompiledProvider[],
  depKeysOf: (slot: CompiledProvider) => readonly RegistryKey[],
): CompiledProvider[] | undefined {
  const keyToSlot = new Map<RegistryKey, CompiledProvider>();
  for (const slot of list) {
    keyToSlot.set(slot.np.key, slot);
  }

  const inDegree = new Map<RegistryKey, number>();
  const dependents = new Map<RegistryKey, RegistryKey[]>();

  for (const slot of list) {
    if (!inDegree.has(slot.np.key)) inDegree.set(slot.np.key, 0);
    const depKeys = depKeysOf(slot);
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
  return ordered;
}
