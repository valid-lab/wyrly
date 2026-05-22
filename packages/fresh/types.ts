import type { Context, HandlerFn } from "fresh";
import type { Scope } from "@wyrly/core";

/** Fresh `State` shape with a request DI scope on `ctx.state.di`. */
export interface FreshDIState {
  /** DI scope for this HTTP request */
  di: Scope;
}

/** Options for {@link withDI}. */
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

/** Fresh context with a guaranteed `di` scope (from {@link withDI}). */
export type FreshDIContext<TState extends FreshDIState = FreshDIState> =
  & Context<TState>
  & {
    /** DI scope for this HTTP request */
    di: Scope;
  };

/** Route handler receiving {@link FreshDIContext}. */
export type FreshDIHandler<
  TData = unknown,
  TState extends FreshDIState = FreshDIState,
> = (ctx: FreshDIContext<TState>) => ReturnType<HandlerFn<TData, TState>>;
