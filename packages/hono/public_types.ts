import type { Context as HonoContextBase } from "hono";

/** Hono request context (package-public doc type). */
export interface HonoContext extends HonoContextBase {}

/** Hono middleware signature used by `di()` (package-public doc type). */
export type HonoMiddlewareHandler = (
  c: HonoContext,
  next: () => Promise<void>,
) => Promise<void | Response>;
