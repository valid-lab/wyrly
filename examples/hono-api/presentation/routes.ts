import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "@wyrly/core";
import { di } from "@wyrly/hono";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../domain/user.ts";

/** Map X-User-Id to port token CurrentUserToken (presentation layer). */
const mapCurrentUser: MiddlewareHandler = async (c, next) => {
  const userId = c.req.header("X-User-Id") ?? "anonymous";
  c.get("di").set(CurrentUserToken, { id: userId });
  await next();
};

export function createApp(container: Container): Hono {
  const app = new Hono();

  app.use(di(container));
  app.use(mapCurrentUser);

  app.get("/users/:id", async (c) => {
    const id = c.req.param("id");
    const useCase = c.get("di").resolve(GetUserUseCase);
    const user = await useCase.execute(id);
    if (!user) {
      return c.json({ error: "not found" }, 404);
    }
    return c.json(user);
  });

  return app;
}
