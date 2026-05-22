import type { Context } from "hono";
import type { Scope } from "@wyrly/core";

/** Context variable key used by `di()` middleware. */
export const diVariableKey = "di" as const;

/** Pass to `new Hono<{ Variables: HonoDIVariables }>()` for typed `getDI(c)`. */
export type HonoDIVariables = {
  [diVariableKey]: Scope;
};

/** Read the request DI scope set by `di()` (use when `Variables` is not generic). */
export function getDI(c: Context): Scope {
  return c.get(diVariableKey) as Scope;
}
