import { type Token, token } from "@wyrly/core";
import type { NextRequest } from "./public_types.ts";

/** Current Next.js `NextRequest` (resolvable only in request scope) */
export const NextRequestToken: Token<NextRequest> = token<NextRequest>("NextRequest");
