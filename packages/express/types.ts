import type { Request, Response } from "express";
import type { Scope } from "@wyrly/core";

/** Express `Request` with the DI scope attached by `diMiddleware`. */
export type ExpressRequestWithDI = Request & { di: Scope };

/** Options for {@link diMiddleware}. */
export interface ExpressDIOptions {
  /** Called when request-scope disposal rejects after the response lifecycle ends. */
  onDisposeError?: (error: unknown, req: Request, res: Response) => void | Promise<void>;
}

/** Narrow `req` after `diMiddleware` (use instead of casting when route generics block overlap). */
export function asExpressRequestWithDI(req: Request): ExpressRequestWithDI {
  return req as unknown as ExpressRequestWithDI;
}
