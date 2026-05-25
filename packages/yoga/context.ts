import type { Container } from "@wyrly/core";
import { createGraphQLDIContext } from "@wyrly/graphql";
import type { CreateYogaDIContextOptions, YogaDIContext } from "./types.ts";

/**
 * Creates a DI scope for one GraphQL Yoga request.
 * Prefer {@link yogaDIPlugin} + {@link yogaContext} so disposal runs automatically on `onResponse`.
 *
 * In the domain layer, avoid injecting `GraphQLRequestToken` directly;
 * map it to port tokens (e.g. `CurrentUserToken`) via `configureScope` in the composition root.
 */
export async function createYogaDIContext(
  container: Container,
  options: CreateYogaDIContextOptions,
): Promise<YogaDIContext> {
  return await createGraphQLDIContext(container, options);
}
