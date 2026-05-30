import type { NormalizedProvider } from "./provider.ts";
import type { CompiledProvider } from "./resolve_plan.ts";
import { ensureDepKeys } from "./resolve_plan.ts";
import { topoSortSlots } from "./graph_topo.ts";

/** Topologically ordered scoped providers for one-shot per-scope materialization. */
export interface FrozenScopedPlan {
  readonly ordered: readonly CompiledProvider[];
}

export function buildFrozenScopedPlan(
  slots: Iterable<CompiledProvider>,
): FrozenScopedPlan | undefined {
  const list = [...slots];
  if (list.length === 0) return undefined;

  for (const slot of list) {
    if (slot.np.lifetime !== "scoped") return undefined;
  }

  const ordered = topoSortSlots(list, ensureDepKeys);
  if (!ordered) return undefined;

  return { ordered };
}

export function allProvidersScoped(slots: Iterable<{ np: NormalizedProvider }>): boolean {
  let any = false;
  for (const slot of slots) {
    any = true;
    if (slot.np.lifetime !== "scoped") return false;
  }
  return any;
}
