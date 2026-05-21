import type { NextRequest } from "npm:next@15/server.js";
import type { Container } from "@wyrly/core";
import { withDI } from "@wyrly/next";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../domain/user.ts";

export function createRouteHandler(container: Container) {
  return withDI<{ id: string }>(
    container,
    async (_req, { di, params }) => {
      const useCase = di.resolve(GetUserUseCase);
      const user = await useCase.execute(params.id);
      if (!user) {
        return Response.json({ error: "not found" }, { status: 404 });
      }
      return Response.json(user);
    },
    {
      configureScope(scope) {
        scope.set(CurrentUserToken, { id: "user-1" });
      },
    },
  );
}

export function testNextRequest(url = "https://example.com/api/users/user-1"): NextRequest {
  return new Request(url) as NextRequest;
}
