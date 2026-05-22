import type { NextRequest } from "npm:next@15/server.js";
import { type Token, token } from "@wyrly/core";

/** Current Next.js `NextRequest` (resolvable only in request scope) */
export const NextRequestToken: Token<NextRequest> = token<NextRequest>("NextRequest");
