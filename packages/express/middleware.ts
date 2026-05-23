import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Container } from "@wyrly/core";
import { ExpressRequestToken, ExpressResponseToken } from "./tokens.ts";
import { asExpressRequestWithDI, type ExpressDIOptions } from "./types.ts";

/**
 * Creates a DI scope per request and attaches it to `req.di`.
 * Disposes the scope on response `finish` / `close`.
 *
 * In the domain layer, avoid injecting `ExpressRequestToken` directly;
 * map it to port tokens (e.g. `CurrentUser`) in the composition root instead.
 */
export function diMiddleware(container: Container, options: ExpressDIOptions = {}): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    scope.set(ExpressRequestToken, req);
    scope.set(ExpressResponseToken, res);
    asExpressRequestWithDI(req).di = scope;

    let disposeStarted = false;
    const disposeScope = () => {
      if (disposeStarted) return;
      disposeStarted = true;
      void scope.dispose().catch((error) => {
        if (!options.onDisposeError) return;
        void Promise.resolve(options.onDisposeError(error, req, res)).catch(() => {
          // Disposal happens after the response lifecycle; avoid unhandled rejections here.
        });
      });
    };
    res.once("finish", disposeScope);
    res.once("close", disposeScope);

    next();
  };
}
