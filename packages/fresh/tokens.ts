import type { Context } from "fresh";
import { type Token, token } from "@wyrly/core";
import type { FreshDIState } from "./types.ts";

/** Current Fresh `Context` (resolvable only in request scope) */
export const FreshContextToken: Token<Context<FreshDIState>> = token<Context<FreshDIState>>(
  "FreshContext",
);

/** Current Web API `Request` (`ctx.req`; resolvable only in request scope) */
export const RequestToken: Token<Request> = token<Request>("Request");
