import type { FastifyReply, FastifyRequest } from "fastify";
import { type Token, token } from "@wyrly/core";

/**
 * Current Fastify `request` (request scope only).
 * **Do not inject into domain or use cases** — map to port tokens in a `preHandler` instead.
 */
export const FastifyRequestToken: Token<FastifyRequest> = token<FastifyRequest>("FastifyRequest");

/**
 * Current Fastify `reply` (request scope only).
 * **Do not inject into domain or use cases** — map to port tokens in a `preHandler` instead.
 */
export const FastifyReplyToken: Token<FastifyReply> = token<FastifyReply>("FastifyReply");
