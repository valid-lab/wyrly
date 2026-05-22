import type { Request, Response } from "express";
import { type Token, token } from "@wyrly/core";

/** Current Express `Request` (resolvable only in request scope) */
export const ExpressRequestToken: Token<Request> = token<Request>("ExpressRequest");

/** Current Express `Response` (resolvable only in request scope) */
export const ExpressResponseToken: Token<Response> = token<Response>("ExpressResponse");
