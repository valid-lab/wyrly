import { Injectable } from "@wyrly/core";
import { CurrentUserToken, type UserRepository, UserRepositoryToken } from "../domain/user.ts";

@Injectable({
  deps: [UserRepositoryToken, CurrentUserToken],
  lifetime: "scoped",
})
export class GetUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly _currentUser: { id: string },
  ) {}

  execute(targetId: string) {
    return this.users.findById(targetId);
  }
}
