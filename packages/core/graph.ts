import type { Lifetime } from "./lifetime.ts";
import type { NormalizedProvider, ProviderType } from "./provider.ts";
import { graphNodeId, tokenLabel } from "./internal_keys.ts";
import type { InjectionToken } from "./token.ts";
import { getInjectableMetadata } from "./metadata.ts";

export interface DependencyNode {
  id: string;
  name: string;
  lifetime: Lifetime;
  provider: ProviderType;
}

export interface DependencyEdge {
  from: string;
  to: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export function inferLifetimeForToken(dep: InjectionToken<unknown>): Lifetime {
  if (typeof dep === "function") {
    const meta = getInjectableMetadata(dep);
    if (meta?.lifetime) return meta.lifetime;
  }
  return "singleton";
}

export function buildGraph(
  providers: Iterable<NormalizedProvider<unknown>>,
): DependencyGraph {
  const nodes = new Map<string, DependencyNode>();
  const edges: DependencyEdge[] = [];
  const list = [...providers];

  for (const p of list) {
    const id = graphNodeId(p.token);
    nodes.set(id, {
      id,
      name: tokenLabel(p.token),
      lifetime: p.lifetime,
      provider: p.providerType,
    });
  }

  for (const p of list) {
    const id = graphNodeId(p.token);
    for (const dep of p.deps) {
      const toId = graphNodeId(dep);
      if (!nodes.has(toId)) {
        nodes.set(toId, {
          id: toId,
          name: tokenLabel(dep),
          lifetime: inferLifetimeForToken(dep),
          provider: "class",
        });
      }
      edges.push({ from: id, to: toId });
    }
  }

  return { nodes: [...nodes.values()], edges: dedupeEdges(edges) };
}

/** Collapses duplicate edges with the same from/to into one */
export function dedupeEdges(edges: DependencyEdge[]): DependencyEdge[] {
  const seen = new Set<string>();
  const out: DependencyEdge[] = [];
  for (const e of edges) {
    const key = `${e.from}\0${e.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

import type { RegistryKey } from "./internal_keys.ts";

export function collectRegisteredProviders(
  registry: Map<RegistryKey, NormalizedProvider<unknown>>,
): NormalizedProvider<unknown>[] {
  return [...registry.values()];
}

/** For inspect: include @Injectable-only classes not registered as tokens */
export function augmentGraphWithInjectableClasses(
  graph: DependencyGraph,
  extraClasses: Iterable<InjectionToken<unknown>>,
): DependencyGraph {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const edges = [...graph.edges];

  for (const t of extraClasses) {
    if (typeof t !== "function") continue;
    const id = graphNodeId(t);
    if (nodes.has(id)) continue;
    nodes.set(id, {
      id,
      name: tokenLabel(t),
      lifetime: inferLifetimeForToken(t),
      provider: "class",
    });
  }

  return { nodes: [...nodes.values()], edges: dedupeEdges(edges) };
}
