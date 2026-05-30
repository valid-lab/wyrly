import { assertEquals } from "jsr:@std/assert@1";
import { topoSortSlots } from "./graph_topo.ts";
import type { CompiledProvider } from "./resolve_plan.ts";
import type { NormalizedProvider } from "./provider.ts";
import { registryKey } from "./internal_keys.ts";
import { type InjectionToken, token } from "./token.ts";

const tokenByName = new Map<string, InjectionToken<unknown>>();
function namedToken(id: string): InjectionToken<unknown> {
  let t = tokenByName.get(id);
  if (!t) {
    t = token<unknown>(id);
    tokenByName.set(id, t);
  }
  return t;
}

function slot(
  id: string,
  lifetime: "singleton" | "scoped",
  deps: string[],
): CompiledProvider {
  const t = namedToken(id);
  const np = {
    token: t,
    key: registryKey(t),
    providerType: "value" as const,
    deps: deps.map((d) => namedToken(d)),
    lifetime,
    useValue: id,
  } satisfies NormalizedProvider;
  return {
    np,
    slotIndex: 0,
    depKeys: deps.map((d) => registryKey(namedToken(d))),
  };
}

Deno.test("topoSortSlots orders dependencies before dependents", () => {
  const a = slot("a", "scoped", []);
  const b = slot("b", "scoped", ["a"]);
  const c = slot("c", "scoped", ["b"]);
  const ordered = topoSortSlots([c, b, a], (s) => s.depKeys!);
  assertEquals(ordered?.map((s) => s.np.useValue), ["a", "b", "c"]);
});

Deno.test("topoSortSlots returns undefined on cycle", () => {
  const a = slot("a", "scoped", ["b"]);
  const b = slot("b", "scoped", ["a"]);
  const ordered = topoSortSlots([a, b], (s) => s.depKeys!);
  assertEquals(ordered, undefined);
});
