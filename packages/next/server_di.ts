import { cache } from "react";
import { after } from "npm:next@15/server.js";
import type { Container } from "@wyrly/core";
import type { CreateServerDIOptions } from "./types.ts";
import type { Scope } from "@wyrly/core";

/**
 * DI factory for Server Components.
 * Shares one scope per request via `cache()` and disposes after the response with `after()`.
 *
 * Requires Next.js 15+ App Router. Call `getDI()` within the request context (Page, layout, etc.).
 * In the domain layer, map framework tokens to port tokens instead of injecting them directly.
 */
export function createServerDI(
  container: Container,
  options?: CreateServerDIOptions,
): { getDI: () => Scope } {
  const scheduleAfter = options?.after ?? after;

  const getScope = cache(() => {
    const scope = container.createScope();
    scheduleAfter(() => scope.dispose());
    return scope;
  });

  return {
    getDI: (): Scope => getScope(),
  };
}
