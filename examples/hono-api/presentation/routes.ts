import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "@wyrly/core";
import { di, getDI, type HonoDIVariables } from "@wyrly/hono";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../domain/user.ts";

/** Map X-User-Id to port token CurrentUserToken (presentation layer). */
const mapCurrentUser: MiddlewareHandler<{ Variables: HonoDIVariables }> = async (c, next) => {
  const userId = c.req.header("X-User-Id") ?? "anonymous";
  getDI(c).set(CurrentUserToken, { id: userId });
  await next();
};

export function createApp(container: Container): Hono<{ Variables: HonoDIVariables }> {
  const app = new Hono<{ Variables: HonoDIVariables }>();

  app.use(di(container));
  app.use(mapCurrentUser);

  app.get("/users/:id", async (c) => {
    const id = c.req.param("id");
    const useCase = getDI(c).resolve(GetUserUseCase);
    const user = await useCase.execute(id);
    if (!user) {
      return c.json({ error: "not found" }, 404);
    }
    return c.json(user);
  });

  return app;
}
