import type { Context, Middleware } from "fresh";
import type { Container, Scope } from "@wyrly/core";
import { FreshContextToken, RequestToken } from "./tokens.ts";
import type { FreshDIOptions, FreshDIState } from "./types.ts";

/**
 * Creates a DI scope per request and attaches it to `ctx.state.di`.
 * Disposes the scope after `ctx.next()` (including on handler error, via `finally`).
 *
 * In the domain layer, avoid injecting `FreshContextToken` / `RequestToken` directly;
 * map them to port tokens (e.g. `CurrentUser`) in the composition root instead.
 */
export function di<TState extends FreshDIState = FreshDIState>(
  container: Container,
  options?: FreshDIOptions<TState>,
): Middleware<TState> {
  return async (ctx) => {
    const scope = createFreshScope(container, ctx);
    try {
      if (options?.configureScope) {
        await options.configureScope(scope, ctx);
      }
      return await ctx.next();
    } finally {
      await scope.dispose();
    }
  };
}

export function createFreshScope<TState extends FreshDIState>(
  container: Container,
  ctx: Context<TState>,
): Scope {
  const scope = container.createScope();
  scope.set(FreshContextToken, ctx);
  scope.set(RequestToken, ctx.req);
  ctx.state.di = scope;
  return scope;
}
