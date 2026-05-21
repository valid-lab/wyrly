import type { NextRequest } from "npm:next@15/server.js";
import type { Container } from "@wyrly/core";
import { NextRequestToken } from "./tokens.ts";
import type { RouteHandlerContext, WithDIOptions } from "./types.ts";

/**
 * Creates a DI scope per Route Handler and passes `{ di, params }`.
 * Disposes the scope after the handler completes (including on error, via `finally`).
 *
 * In the domain layer, avoid injecting `NextRequestToken` directly;
 * map it to port tokens via `configureScope` instead.
 */
export function withDI<TParams extends Record<string, string | string[]>>(
  container: Container,
  handler: (
    req: NextRequest,
    ctx: RouteHandlerContext<TParams>,
  ) => Response | Promise<Response>,
  options?: WithDIOptions,
): (
  req: NextRequest,
  routeCtx: { params: TParams | Promise<TParams> },
) => Promise<Response> {
  return async (req, routeCtx) => {
    const scope = container.createScope();
    scope.set(NextRequestToken, req);
    if (options?.configureScope) {
      await options.configureScope(scope);
    }
    try {
      const params = await Promise.resolve(routeCtx.params);
      return await handler(req, { di: scope, params });
    } finally {
      await scope.dispose();
    }
  };
}
