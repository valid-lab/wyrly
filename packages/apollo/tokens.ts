import { type Token, token } from "@wyrly/core";
import type { ApolloHTTPRequestLike, ApolloHTTPResponseLike } from "./request.ts";

export { GraphQLRequestToken, GraphQLResponseToken } from "@wyrly/graphql";

/**
 * Current Apollo / Node HTTP request (request scope only).
 * **Do not inject into domain or use cases** — map to port tokens in `configureScope`.
 */
export const ApolloRequestToken: Token<ApolloHTTPRequestLike> = token<ApolloHTTPRequestLike>(
  "ApolloRequest",
);

/**
 * Current Apollo / Node HTTP response (request scope only).
 * **Do not inject into domain or use cases** — map to port tokens in `configureScope`.
 */
export const ApolloResponseToken: Token<ApolloHTTPResponseLike> = token<ApolloHTTPResponseLike>(
  "ApolloResponse",
);
