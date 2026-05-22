import type { Request } from "express";
import type { Scope } from "@wyrly/core";

/** Express `Request` with the DI scope attached by `diMiddleware`. */
export type ExpressRequestWithDI = Request & { di: Scope };
