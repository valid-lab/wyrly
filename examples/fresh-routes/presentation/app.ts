import { App } from "fresh";
import type { Context } from "fresh";
import type { Container } from "@wyrly/core";
import { di, type FreshDIState, withDI } from "@wyrly/fresh";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../domain/user.ts";

function configureCurrentUser(
  scope: { set: (t: typeof CurrentUserToken, v: { id: string }) => void },
  ctx: Context<FreshDIState>,
): void {
  const userId = ctx.req.headers.get("X-User-Id") ?? "anonymous";
  scope.set(CurrentUserToken, { id: userId });
}

function paramId(ctx: Context<FreshDIState>): string {
  return ctx.params.id ?? "";
}

/** `di()` middleware + `ctx.state.di` */
export function createMiddlewareHandler(container: Container) {
  return new App<FreshDIState>()
    .use(
      di(container, {
        configureScope(scope, ctx) {
          configureCurrentUser(scope, ctx);
        },
      }),
    )
    .get("/users/:id", (ctx) => {
      const useCase = ctx.state.di.resolve(GetUserUseCase);
      return useCase.execute(paramId(ctx)).then((u) =>
        u ? Response.json(u) : Response.json({ error: "not found" }, { status: 404 })
      );
    })
    .handler();
}

/** `withDI()` route handler (demo: invoke outside App) */
export function createWithDIHandler(container: Container) {
  return withDI(
    container,
    (ctx) => {
      const useCase = ctx.di.resolve(GetUserUseCase);
      return useCase.execute(paramId(ctx)).then((u) =>
        u ? Response.json(u) : Response.json({ error: "not found" }, { status: 404 })
      );
    },
    {
      configureScope(scope, ctx) {
        configureCurrentUser(scope, ctx);
      },
    },
  );
}
