import type { Container } from "@wyrly/core";
import { withActionDI } from "@wyrly/next";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../composition/tokens.ts";
import { UserId } from "../domain/user.ts";

export function createUpdateUserAction(container: Container) {
  return withActionDI(container, async (di, formData) => {
    const userId = formData.get("userId");
    const targetId = typeof userId === "string" ? userId : "user-1";
    di.set(CurrentUserToken, { id: UserId.from("user-1") });

    const useCase = di.resolve(GetUserUseCase);
    const user = await useCase.execute(UserId.from(targetId));
    return { ok: true, user };
  });
}
