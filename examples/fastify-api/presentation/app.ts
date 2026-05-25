import type { FastifyReply, FastifyRequest } from "fastify";
import Fastify from "fastify";
import type { Container } from "@wyrly/core";
import { diPlugin, getDI } from "@wyrly/fastify";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../composition/tokens.ts";
import { UserId } from "../domain/user.ts";

function mapCurrentUser(request: FastifyRequest, _reply: FastifyReply, done: () => void): void {
  const userId = request.headers["x-user-id"];
  const id = typeof userId === "string" ? userId : "anonymous";
  getDI(request).set(CurrentUserToken, { id: UserId.from(id) });
  done();
}

export async function createApp(container: Container) {
  const app = Fastify();

  await app.register(diPlugin(container));
  app.addHook("preHandler", mapCurrentUser);

  app.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    const useCase = getDI(request).resolve(GetUserUseCase);
    const user = await useCase.execute(UserId.from(request.params.id));
    if (!user) {
      return reply.status(404).send({ error: "not found" });
    }
    return reply.send(user);
  });

  return app;
}
