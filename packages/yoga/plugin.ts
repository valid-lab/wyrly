import type { Container } from "@wyrly/core";
import { createYogaDIContext } from "./context.ts";
import type {
  YogaDIContext,
  YogaDIPlugin,
  YogaDIPluginOptions,
  YogaServerContext,
} from "./types.ts";

const requestContexts = new WeakMap<Request, YogaDIContext>();

/**
 * GraphQL Yoga / Envelop plugin: one DI scope per request, disposed on `onResponse`.
 *
 * Pair with {@link yogaContext} in your Yoga `context` option so resolvers receive `ctx.wyrly`.
 *
 * In the domain layer, avoid injecting `GraphQLRequestToken` directly;
 * map request data to port tokens in `configureScope` instead.
 */
export function yogaDIPlugin(
  container: Container,
  options: YogaDIPluginOptions = {},
): YogaDIPlugin {
  return {
    async onRequest({ request }) {
      const wyrly = await createYogaDIContext(container, {
        request,
        ...(options.response !== undefined ? { response: options.response } : {}),
        ...(options.configureScope !== undefined ? { configureScope: options.configureScope } : {}),
      });
      requestContexts.set(request, wyrly);
    },
    async onResponse({ request }) {
      const wyrly = requestContexts.get(request);
      if (!wyrly) return;
      requestContexts.delete(request);
      await wyrly.di.dispose({
        ...(options.onDisposeError !== undefined
          ? {
            onError: (error: unknown) => {
              void Promise.resolve(options.onDisposeError!(error, request)).catch(() => {
                // Response lifecycle: avoid unhandled rejections from user handler.
              });
            },
          }
          : {}),
      });
    },
  };
}

/**
 * Yoga `context` callback that reads the scope created by {@link yogaDIPlugin}.
 * Register the plugin before relying on this function.
 */
export function yogaContext({ request }: { request: Request }): YogaServerContext {
  const wyrly = requestContexts.get(request);
  if (!wyrly) {
    throw new Error(
      "Wyrly DI context missing — register yogaDIPlugin(container) on the Yoga server before using yogaContext.",
    );
  }
  return { wyrly };
}
