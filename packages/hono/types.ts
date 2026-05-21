import type { Scope } from "@wyrly/core";

declare module "hono" {
  interface ContextVariableMap {
    /** DI scope for this HTTP request */
    di: Scope;
  }
}
