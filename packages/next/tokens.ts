import type { NextRequest } from "npm:next@15/server.js";
import { token } from "@wyrly/core";

/** Current Next.js `NextRequest` (resolvable only in request scope) */
export const NextRequestToken = token<NextRequest>("NextRequest");
