import type { ClassToken } from "./token.ts";
import type { InjectionToken } from "./token.ts";
import type { Lifetime } from "./lifetime.ts";
import type { NormalizedProvider } from "./provider.ts";
import { buildGraph } from "./graph.ts";
import { getInjectableMetadata } from "./metadata.ts";
import { graphNodeId } from "./internal_keys.ts";
import {
  type Locale,
  resolveLocale,
  validationMessage,
  type ValidationMessageCode,
} from "./i18n.ts";

/** Single design-time validation finding. */
export interface ValidationIssue {
  /** `"error"` blocks `ok`; `"warning"` is informational. */
  severity: "error" | "warning";
  /** Stable machine-readable code. */
  code: string;
  /** Localized human-readable message. */
  message: string;
}

/** Result of {@link Container.validate} or {@link validateNormalizedProviders}. */
export interface ValidationResult {
  /** `true` when no issues have `severity: "error"`. */
  ok: boolean;
  /** All errors and warnings collected. */
  issues: ValidationIssue[];
}

/** Options for validation and localized messages. */
export interface ValidateOptions {
  /** Locale for issue messages (`en` or `ja`). */
  locale?: Locale;
}

function providerMap(
  providers: Iterable<NormalizedProvider<unknown>>,
): Map<string, NormalizedProvider<unknown>> {
  const m = new Map<string, NormalizedProvider<unknown>>();
  for (const p of providers) {
    m.set(graphNodeId(p.token), p);
  }
  return m;
}

function isResolvableDependency(
  dep: InjectionToken<unknown>,
  byKey: Map<string, NormalizedProvider<unknown>>,
): boolean {
  const id = graphNodeId(dep);
  if (byKey.has(id)) return true;
  if (typeof dep === "function" && getInjectableMetadata(dep)) return true;
  return false;
}

function lifetimeForDepToken(
  dep: InjectionToken<unknown>,
  byKey: Map<string, NormalizedProvider<unknown>>,
): Lifetime | undefined {
  const id = graphNodeId(dep);
  const hit = byKey.get(id);
  if (hit) return hit.lifetime;
  if (typeof dep === "function") {
    const meta = getInjectableMetadata(dep);
    if (meta) return meta.lifetime ?? "singleton";
  }
  return undefined;
}

function issue(
  severity: ValidationIssue["severity"],
  code: ValidationMessageCode,
  params: Record<string, string>,
  locale: Locale,
): ValidationIssue {
  return {
    severity,
    code,
    message: validationMessage(code, params, locale),
  };
}

function depIdSet(deps: readonly InjectionToken<unknown>[]): Set<string> {
  return new Set(deps.map((d) => graphNodeId(d)));
}

function sameDepSet(
  a: readonly InjectionToken<unknown>[],
  b: readonly InjectionToken<unknown>[],
): boolean {
  const sa = depIdSet(a);
  const sb = depIdSet(b);
  if (sa.size !== sb.size) return false;
  for (const id of sa) {
    if (!sb.has(id)) return false;
  }
  return true;
}

function lifetimeForNode(
  id: string,
  byId: Map<string, NormalizedProvider<unknown>>,
): Lifetime | undefined {
  const hit = byId.get(id);
  if (hit) return hit.lifetime;
  return undefined;
}

function reachableScopedDependency(
  startId: string,
  _fromLt: Lifetime,
  byId: Map<string, NormalizedProvider<unknown>>,
  adj: Map<string, string[]>,
): { depId: string } | null {
  const visiting = new Set<string>();
  const visit = (id: string): { depId: string } | null => {
    if (visiting.has(id)) return null;
    visiting.add(id);
    const lt = lifetimeForNode(id, byId);
    if (lt === "scoped" && id !== startId) {
      return { depId: id };
    }
    for (const to of adj.get(id) ?? []) {
      const hit = visit(to);
      if (hit) return hit;
    }
    visiting.delete(id);
    return null;
  };

  for (const to of adj.get(startId) ?? []) {
    const toLt = lifetimeForNode(to, byId);
    if (toLt === "scoped") {
      return { depId: to };
    }
    const nested = visit(to);
    if (nested) return nested;
  }
  return null;
}

/**
 * Build a graph from registered providers and check cycles, lifetimes, and orphans.
 */
export function validateNormalizedProviders(
  providers: NormalizedProvider<unknown>[],
  options?: ValidateOptions,
): ValidationResult {
  const locale = resolveLocale(options);
  const issues: ValidationIssue[] = [];
  const graph = buildGraph(providers);
  const byId = providerMap(providers);

  for (const p of providers) {
    if (p.providerType === "class" && p.useClass) {
      const meta = getInjectableMetadata(p.useClass as ClassToken<unknown>);
      if (meta?.deps !== undefined && !sameDepSet(p.deps, meta.deps)) {
        issues.push(
          issue("warning", "injectable_deps_mismatch", {
            fromId: graphNodeId(p.token),
            depId: "",
          }, locale),
        );
      }
      if (
        meta?.lifetime !== undefined &&
        meta.lifetime !== p.lifetime
      ) {
        issues.push(
          issue("warning", "injectable_lifetime_mismatch", {
            fromId: graphNodeId(p.token),
            depId: "",
            registeredLt: p.lifetime,
            decoratorLt: meta.lifetime,
          }, locale),
        );
      }
    }
  }

  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  for (const p of providers) {
    const fromLt = p.lifetime;
    if (fromLt !== "singleton" && fromLt !== "transient") continue;
    const fromId = graphNodeId(p.token);
    const transitive = reachableScopedDependency(fromId, fromLt, byId, adj);
    if (transitive) {
      issues.push(
        issue("error", "transitive_singleton_depends_on_scoped", {
          fromId,
          depId: transitive.depId,
          fromLt,
        }, locale),
      );
    }
  }

  for (const p of providers) {
    const fromLt = p.lifetime;
    const fromId = graphNodeId(p.token);
    for (const dep of p.deps) {
      if (!isResolvableDependency(dep, byId)) {
        issues.push(
          issue("error", "unresolved_dependency", {
            fromId,
            depId: graphNodeId(dep),
          }, locale),
        );
        continue;
      }
      const toLt = lifetimeForDepToken(dep, byId);
      if (toLt === undefined) continue;
      if (fromLt === "singleton" && toLt === "scoped") {
        issues.push(
          issue("error", "singleton_depends_on_scoped", {
            fromId,
            depId: graphNodeId(dep),
          }, locale),
        );
      }
      if (fromLt === "transient" && toLt === "scoped") {
        issues.push(
          issue("warning", "transient_depends_on_scoped", {
            fromId,
            depId: graphNodeId(dep),
          }, locale),
        );
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const dfs = (id: string, stack: string[]): string[] | null => {
    if (visiting.has(id)) {
      const idx = stack.indexOf(id);
      return idx >= 0 ? [...stack.slice(idx), id] : [...stack, id];
    }
    if (visited.has(id)) return null;
    visiting.add(id);
    stack.push(id);
    for (const to of adj.get(id) ?? []) {
      const c = dfs(to, stack);
      if (c) return c;
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    return null;
  };

  for (const n of graph.nodes) {
    if (visited.has(n.id)) continue;
    const cycle = dfs(n.id, []);
    if (cycle && cycle.length > 0) {
      issues.push(
        issue("error", "circular_dependency", {
          fromId: "",
          depId: "",
          cycle: cycle.join(" -> "),
        }, locale),
      );
      break;
    }
  }

  const hasIncoming = new Set<string>();
  for (const e of graph.edges) {
    hasIncoming.add(e.to);
  }
  for (const p of providers) {
    const id = graphNodeId(p.token);
    if (!hasIncoming.has(id)) {
      issues.push(
        issue("warning", "unused_provider", { fromId: id, depId: "" }, locale),
      );
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  return { ok: errors.length === 0, issues };
}
