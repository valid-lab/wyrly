import type { Container } from "@wyrly/core";
import { createGraphQLDIContext } from "@wyrly/graphql";
import { ApolloRequestToken, ApolloResponseToken } from "./tokens.ts";
import { toFetchRequest } from "./request.ts";
import type { ApolloDIContext, CreateApolloDIContextOptions } from "./types.ts";

function resolveFetchRequest(options: CreateApolloDIContextOptions): Request {
  if (options.request !== undefined) return options.request;
  if (options.apolloHttp?.req !== undefined) {
    return toFetchRequest(options.apolloHttp.req);
  }
  throw new Error(
    "createApolloDIContext requires `request` or `apolloHttp.req` — provide a Fetch Request or Node HTTP metadata.",
  );
}

/**
 * Creates a DI scope for one Apollo Server GraphQL operation.
 * Prefer {@link apolloDIPlugin} so disposal runs automatically in `willSendResponse`.
 *
 * In the domain layer, avoid injecting `ApolloRequestToken` or `GraphQLRequestToken` directly;
 * map HTTP data to port tokens (e.g. `CurrentUserToken`) via `configureScope` in the composition root.
 */
export async function createApolloDIContext(
  container: Container,
  options: CreateApolloDIContextOptions,
): Promise<ApolloDIContext> {
  const request = resolveFetchRequest(options);
  const ctx = await createGraphQLDIContext(container, {
    request,
    ...(options.response !== undefined ? { response: options.response } : {}),
    ...(options.configureScope !== undefined ? { configureScope: options.configureScope } : {}),
  });

  if (options.apolloHttp?.req !== undefined) {
    ctx.di.set(ApolloRequestToken, options.apolloHttp.req);
  }
  if (options.apolloHttp?.res !== undefined) {
    ctx.di.set(ApolloResponseToken, options.apolloHttp.res);
  }

  return ctx;
}
