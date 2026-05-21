import type { Context, HandlerFn } from "fresh";
import type { Scope } from "@wyrly/core";

export interface FreshDIState {
  /** DI scope for this HTTP request */
  di: Scope;
}

export interface FreshDIOptions<TState extends FreshDIState = FreshDIState> {
  /**
   * Called after scope creation to `scope.set` / `scope.register`.
   * Example: map to `CurrentUserToken`.
   */
  configureScope?: (
    scope: Scope,
    ctx: Context<TState>,
  ) => void | Promise<void>;
}

export type FreshDIContext<TState extends FreshDIState = FreshDIState> =
  & Context<TState>
  & {
    /** DI scope for this HTTP request */
    di: Scope;
  };

export type FreshDIHandler<
  TData = unknown,
  TState extends FreshDIState = FreshDIState,
> = (ctx: FreshDIContext<TState>) => ReturnType<HandlerFn<TData, TState>>;
