import type { Request } from "express";
import type { Scope } from "@wyrly/core";

/** Express `Request` with the DI scope attached by `diMiddleware`. */
export type ExpressRequestWithDI = Request & { di: Scope };

/** Narrow `req` after `diMiddleware` (use instead of casting when route generics block overlap). */
export function asExpressRequestWithDI(req: Request): ExpressRequestWithDI {
  return req as unknown as ExpressRequestWithDI;
}
