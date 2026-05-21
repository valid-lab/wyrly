import { token } from "@wyrly/core";

/** Web API `Request` for the current GraphQL request */
export const GraphQLRequestToken = token<Request>("GraphQLRequest");

/** Web API `Response` for the current GraphQL request */
export const GraphQLResponseToken = token<Response>("GraphQLResponse");
