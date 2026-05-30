import { graphNodeId, type RegistryKey } from "./internal_keys.ts";
import type { InjectionToken } from "./token.ts";

export function graphNodeIdFromKey(key: RegistryKey): string {
  if (typeof key === "function") {
    return graphNodeId(key as InjectionToken<unknown>);
  }
  return `symbol:${String(key)}`;
}

export function pathIdsFromKeys(keys: readonly RegistryKey[]): string[] {
  const out = new Array<string>(keys.length);
  for (let i = 0; i < keys.length; i++) {
    out[i] = graphNodeIdFromKey(keys[i]!);
  }
  return out;
}
