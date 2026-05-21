import type { Request, Response } from "express";
import { token } from "@wyrly/core";

/** Current Express `Request` (resolvable only in request scope) */
export const ExpressRequestToken = token<Request>("ExpressRequest");

/** Current Express `Response` (resolvable only in request scope) */
export const ExpressResponseToken = token<Response>("ExpressResponse");
