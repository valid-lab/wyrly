import {
  allProvidersScoped,
  buildFrozenScopedPlan,
  type FrozenScopedPlan,
} from "./frozen_scoped.ts";
import {
  allProvidersSingleton,
  buildFrozenSingletonPlan,
  type FrozenSingletonPlan,
} from "./frozen_singleton.ts";
import type { CompiledProvider } from "./resolve_plan.ts";
import { compileScopedDepSlotIndices, type ResolvePlan } from "./resolve_plan.ts";

/**
 * Bootstrap / frozen-plan lifecycle (Phase 6.1 semantics).
 * Hot resolve paths read `frozenScopedPlan` / `frozenSingletonPlan` on the container directly;
 * these helpers run at register / createScope boundaries only.
 */
export interface BootstrapFields {
  finalized: boolean;
  frozenSingletonPlan: FrozenSingletonPlan | undefined;
  frozenScopedPlan: FrozenScopedPlan | undefined;
}

export function invalidateBootstrap(
  state: BootstrapFields,
  resolvePlan: ResolvePlan,
  skipScopedInvalidate = false,
): void {
  if (!skipScopedInvalidate) {
    state.frozenScopedPlan = undefined;
  }
  state.frozenSingletonPlan = undefined;
  state.finalized = false;
  resolvePlan.invalidateCompiledSlots();
}

export function finalizeAfterRegisterMany(
  state: BootstrapFields,
  resolvePlan: ResolvePlan,
  skipScopedPlanBuild: boolean,
): void {
  if (!skipScopedPlanBuild) {
    compileScopedDepSlotIndices(resolvePlan);
  }
  state.frozenSingletonPlan = undefined;
  if (!skipScopedPlanBuild) {
    state.frozenScopedPlan = undefined;
  }
  state.finalized = true;
}

export function finalizeFrozenPlans(
  state: BootstrapFields,
  slots: Iterable<CompiledProvider>,
  skipScopedPlanBuild: boolean,
): void {
  if (allProvidersSingleton(slots)) {
    state.frozenSingletonPlan = buildFrozenSingletonPlan(slots);
  } else {
    state.frozenSingletonPlan = undefined;
  }
  if (!skipScopedPlanBuild && allProvidersScoped(slots)) {
    state.frozenScopedPlan = buildFrozenScopedPlan(slots);
  } else if (!skipScopedPlanBuild) {
    state.frozenScopedPlan = undefined;
  }
}

export function ensureFrozenScopedPlan(
  state: BootstrapFields,
  slots: Iterable<CompiledProvider>,
  resolvePlan: ResolvePlan,
): void {
  if (state.frozenScopedPlan !== undefined) return;
  if (!allProvidersScoped(slots)) return;
  compileScopedDepSlotIndices(resolvePlan);
  state.frozenScopedPlan = buildFrozenScopedPlan(slots);
}

export function ensureFrozenSingletonPlan(
  state: BootstrapFields,
  slots: Iterable<CompiledProvider>,
): void {
  if (state.frozenSingletonPlan !== undefined) return;
  if (!allProvidersSingleton(slots)) return;
  state.frozenSingletonPlan = buildFrozenSingletonPlan(slots);
}
