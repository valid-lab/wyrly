import type { FastifyReply, FastifyRequest } from "fastify";
import type { Scope } from "@wyrly/core";

/** Fastify `request` with the DI scope attached by {@link diPlugin}. */
export type FastifyRequestWithDI = FastifyRequest & { di: Scope };

/** Options for {@link diPlugin}. */
export interface FastifyDIOptions {
  /** Called when request-scope disposal rejects after the response lifecycle ends. */
  onDisposeError?: (
    error: unknown,
    req: FastifyRequest,
    reply: FastifyReply,
  ) => void | Promise<void>;
}

/** Narrow `request` after {@link diPlugin} (use when route generics block overlap). */
export function asFastifyRequestWithDI(request: FastifyRequest): FastifyRequestWithDI {
  return request as FastifyRequestWithDI;
}

/**
 * Returns the request-scoped DI container set by {@link diPlugin}.
 * Throws if the plugin was not registered on this Fastify instance.
 */
export function getDI(request: FastifyRequest): Scope {
  const req = request as FastifyRequestWithDI;
  if (!req.di) {
    throw new Error(
      "Wyrly DI scope missing — register diPlugin(container) on the Fastify server before calling getDI(request).",
    );
  }
  return req.di;
}
