import type { Container } from "@wyrly/core";
import { createApolloDIContext } from "./context.ts";
import { requestFromApolloGraphQLRequest } from "./request.ts";
import type { ApolloHTTPRequestLike, ApolloHTTPResponseLike } from "./request.ts";
import type {
  ApolloDIContext,
  ApolloDIPluginOptions,
  ApolloDIRequestListener,
  ApolloDIServerPlugin,
  ApolloServerContext,
} from "./types.ts";

function nodeHttpFromContextValue(
  contextValue: Record<string, unknown>,
): { req?: ApolloHTTPRequestLike; res?: ApolloHTTPResponseLike } {
  const req = contextValue["req"];
  const res = contextValue["res"];
  return {
    ...(req !== undefined && typeof req === "object" ? { req: req as ApolloHTTPRequestLike } : {}),
    ...(res !== undefined && typeof res === "object" ? { res: res as ApolloHTTPResponseLike } : {}),
  };
}

/**
 * Apollo Server 4+ plugin: one DI scope per GraphQL operation, disposed in `willSendResponse`.
 *
 * Merges `wyrly` onto `contextValue` (works alongside an existing `context` function).
 * When `contextValue` includes Express `req` / `res`, they are registered as Apollo tokens.
 *
 * In the domain layer, avoid injecting `ApolloRequestToken` directly;
 * map request data to port tokens in `configureScope` instead.
 */
export function apolloDIPlugin<TContext extends object = object>(
  container: Container,
  options: ApolloDIPluginOptions = {},
): ApolloDIServerPlugin<TContext> {
  const baseUrl = options.baseUrl ?? "http://127.0.0.1/graphql";

  return {
    async requestDidStart(requestContext) {
      const fetchRequest = requestFromApolloGraphQLRequest(
        requestContext.request.http,
        baseUrl,
      );
      const nodeHttp = nodeHttpFromContextValue(
        requestContext.contextValue as Record<string, unknown>,
      );
      const apolloHttp = nodeHttp.req !== undefined
        ? {
          req: nodeHttp.req,
          ...(nodeHttp.res !== undefined ? { res: nodeHttp.res } : {}),
        }
        : undefined;

      const wyrly: ApolloDIContext = await createApolloDIContext(container, {
        request: fetchRequest,
        ...(apolloHttp !== undefined ? { apolloHttp } : {}),
        ...(options.configureScope !== undefined ? { configureScope: options.configureScope } : {}),
      });

      Object.assign(
        requestContext.contextValue as object,
        { wyrly } satisfies Partial<
          ApolloServerContext
        >,
      );

      const listener: ApolloDIRequestListener = {
        async willSendResponse() {
          await wyrly.di.dispose({
            ...(options.onDisposeError !== undefined
              ? {
                onError: (error: unknown) => {
                  void Promise.resolve(options.onDisposeError!(error, fetchRequest)).catch(() => {
                    // Response lifecycle: avoid unhandled rejections from user handler.
                  });
                },
              }
              : {}),
          });
        },
      };
      return listener;
    },
  };
}
