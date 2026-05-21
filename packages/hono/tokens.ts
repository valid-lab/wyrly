import type { Context } from "hono";
import { token } from "@wyrly/core";

/** Current Hono `Context` (resolvable only in request scope) */
export const HonoContextToken = token<Context>("HonoContext");

/** Current Web API `Request` (`c.req.raw`; resolvable only in request scope) */
export const RequestToken = token<Request>("Request");
