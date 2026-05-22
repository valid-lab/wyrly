import { type Token, token } from "@wyrly/core";

/** Web API `Request` for the current GraphQL request */
export const GraphQLRequestToken: Token<Request> = token<Request>("GraphQLRequest");

/** Web API `Response` for the current GraphQL request */
export const GraphQLResponseToken: Token<Response> = token<Response>("GraphQLResponse");
