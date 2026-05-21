import type { Scope } from "@wyrly/core";

declare global {
  namespace Express {
    interface Request {
      /** DI scope for this HTTP request */
      di: Scope;
    }
  }
}
