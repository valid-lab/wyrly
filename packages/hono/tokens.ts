import { type Token, token } from "@wyrly/core";
import type { HonoContext } from "./public_types.ts";

/** Current Hono `Context` (resolvable only in request scope) */
export const HonoContextToken: Token<HonoContext> = token<HonoContext>("HonoContext");

/** Current Web API `Request` (`c.req.raw`; resolvable only in request scope) */
export const RequestToken: Token<Request> = token<Request>("Request");
