import type { ClassToken, InjectionToken, Token } from "./token.ts";

export type RegistryKey = symbol | ClassToken<unknown>;

export function registryKey(t: InjectionToken<unknown>): RegistryKey {
  if (typeof t === "function") return t as ClassToken<unknown>;
  return (t as Token<unknown>).id;
}

export function tokenLabel(t: InjectionToken<unknown>): string {
  if (typeof t === "function") {
    return `class:${t.name || "(anonymous)"}`;
  }
  return `token:${(t as Token<unknown>).name}`;
}

export function graphNodeId(t: InjectionToken<unknown>): string {
  if (typeof t === "function") {
    return `class:${t.name || "(anonymous)"}`;
  }
  const tok = t as Token<unknown>;
  return `token:${tok.name}@${String(tok.id)}`;
}
