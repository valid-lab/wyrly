import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import type { Container } from "@wyrly/core";
import { FastifyReplyToken, FastifyRequestToken } from "./tokens.ts";
import { asFastifyRequestWithDI, type FastifyDIOptions } from "./types.ts";

const disposeStarted = new WeakMap<FastifyRequest, boolean>();

function disposeScope(
  request: FastifyRequest,
  reply: FastifyReply,
  options: FastifyDIOptions,
): void {
  if (disposeStarted.get(request)) return;
  disposeStarted.set(request, true);

  const req = asFastifyRequestWithDI(request);
  if (!req.di || req.di.isDisposed()) return;

  void req.di.dispose({
    ...(options.onDisposeError !== undefined
      ? {
        onError: (error: unknown) => {
          void Promise.resolve(options.onDisposeError!(error, request, reply)).catch(() => {
            // Response lifecycle: avoid unhandled rejections from user handler.
          });
        },
      }
      : {}),
  });
}

/** Register DI hooks on a Fastify instance (used by {@link diPlugin}). */
export function registerDiHooks(
  fastify: FastifyInstance,
  container: Container,
  options: FastifyDIOptions = {},
): void {
  fastify.addHook("onRequest", (request, reply) => {
    const scope = container.createScope();
    scope.set(FastifyRequestToken, request);
    scope.set(FastifyReplyToken, reply);
    asFastifyRequestWithDI(request).di = scope;

    const disposeOnce = () => disposeScope(request, reply, options);
    reply.raw.once("finish", disposeOnce);
    reply.raw.once("close", disposeOnce);
  });
}

/**
 * Fastify plugin: one DI scope per HTTP request, disposed on response `finish` / `close`.
 *
 * Register with `await app.register(diPlugin(container))`. Use {@link getDI} or
 * {@link asFastifyRequestWithDI} in route handlers.
 */
export function diPlugin(
  container: Container,
  options: FastifyDIOptions = {},
): FastifyPluginAsync {
  return fp((fastify) => {
    registerDiHooks(fastify, container, options);
    return Promise.resolve();
  }, { name: "@wyrly/di-plugin", fastify: "5.x" });
}
