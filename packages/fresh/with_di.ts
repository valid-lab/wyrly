import type { HandlerFn } from "fresh";
import type { Container } from "@wyrly/core";
import { createFreshScope } from "./middleware.ts";
import type { FreshDIHandler, FreshDIOptions, FreshDIState } from "./types.ts";

/**
 * Creates a DI scope per Fresh route handler and adds `di` to the handler ctx.
 * Disposes the scope after the handler completes (including on error, via `finally`).
 */
export function withDI<
  TData = unknown,
  TState extends FreshDIState = FreshDIState,
>(
  container: Container,
  handler: FreshDIHandler<TData, TState>,
  options?: FreshDIOptions<TState>,
): HandlerFn<TData, TState> {
  return async (ctx) => {
    const scope = createFreshScope(container, ctx);
    try {
      if (options?.configureScope) {
        await options.configureScope(scope, ctx);
      }
      return await handler(Object.assign(ctx, { di: scope }));
    } finally {
      await scope.dispose();
    }
  };
}
