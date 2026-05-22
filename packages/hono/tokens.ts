import type { Context } from "hono";
import { type Token, token } from "@wyrly/core";

/** Current Hono `Context` (resolvable only in request scope) */
export const HonoContextToken: Token<Context> = token<Context>("HonoContext");

/** Current Web API `Request` (`c.req.raw`; resolvable only in request scope) */
export const RequestToken: Token<Request> = token<Request>("Request");
