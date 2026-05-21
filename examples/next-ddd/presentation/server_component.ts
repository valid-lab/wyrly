import type { Container } from "@wyrly/core";
import { createServerDI } from "@wyrly/next";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../domain/user.ts";

/** RSC demo: mock `after()` to dispose after response */
export function createServerComponentDemo(container: Container) {
  const { getDI } = createServerDI(container, {
    after(fn: () => void | Promise<void>) {
      queueMicrotask(() => void fn());
    },
  });

  return async function loadUserPage(id: string): Promise<unknown> {
    const di = getDI();
    di.set(CurrentUserToken, { id: "user-1" });
    const useCase = di.resolve(GetUserUseCase);
    const user = await useCase.execute(id);
    await new Promise((r) => setTimeout(r, 0));
    return user;
  };
}
