import type { Scope } from "@wyrly/core";

/** Same shape as `after()` from `next/server` (for test substitution) */
export type AfterScheduler = (callback: () => void | Promise<void>) => void;

export interface RouteHandlerContext<TParams extends Record<string, string | string[]>> {
  di: Scope;
  params: TParams;
}

export interface WithDIOptions {
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: map to `CurrentUserToken`.
   */
  configureScope?: (scope: Scope) => void | Promise<void>;
}

export interface CreateServerDIOptions {
  /** For tests. Defaults to `after` from `next/server` when omitted */
  after?: AfterScheduler;
}
