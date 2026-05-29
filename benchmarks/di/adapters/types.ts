export const ADAPTER_NAMES = [
  "vanilla",
  "wyrly",
  "typed-inject",
  "tsyringe",
  "inversify",
  "nestjs",
] as const;

export type AdapterName = (typeof ADAPTER_NAMES)[number];

export const SUITE_NAMES = [
  "resolution",
  "cold_start",
  "cold_start_resolution",
  "request_scope",
] as const;

export type SuiteName = (typeof SUITE_NAMES)[number];

/** Runtime handle returned by an adapter after bootstrap. */
export interface BenchContext {
  /** Resolve the graph entry point (RootService.run()). */
  resolveRoot(): unknown;
  /** Tear down resources (scopes, Nest application context, etc.). */
  dispose(): Promise<void> | void;
}

export interface BenchAdapter {
  readonly name: AdapterName;
  /** Build a singleton-scoped container / graph. */
  create(): Promise<BenchContext> | BenchContext;
  /** Build a request-scoped unit (one simulated HTTP request). */
  createRequestScope(): Promise<BenchContext> | BenchContext;
}

export function isAdapterName(value: string): value is AdapterName {
  return (ADAPTER_NAMES as readonly string[]).includes(value);
}

export function isSuiteName(value: string): value is SuiteName {
  return (SUITE_NAMES as readonly string[]).includes(value);
}
