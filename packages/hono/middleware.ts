import type { MiddlewareHandler } from "hono";
import type { Container } from "@wyrly/core";
import type { HonoMiddlewareHandler } from "./public_types.ts";
import { HonoContextToken, RequestToken } from "./tokens.ts";
import { diVariableKey } from "./types.ts";

/**
 * Creates a DI scope per request and attaches it via `c.set("di", scope)`.
 * Disposes the scope after `await next()` (including on handler error, via `finally`).
 *
 * In the domain layer, avoid injecting `HonoContextToken` / `RequestToken` directly;
 * map them to port tokens (e.g. `CurrentUser`) in the composition root instead.
 */
export function di(container: Container): HonoMiddlewareHandler {
  const handler: MiddlewareHandler = async (c, next) => {
    const scope = container.createScope();
    scope.set(HonoContextToken, c);
    scope.set(RequestToken, c.req.raw);
    c.set(diVariableKey, scope);
    try {
      await next();
    } finally {
      await scope.dispose();
    }
  };
  return handler;
}
