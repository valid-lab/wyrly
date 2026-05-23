import type { UserId, UserRepository } from "../domain/user.ts";

export interface CurrentUser {
  id: UserId;
}

export class GetUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  execute(targetId: UserId) {
    if (!this.currentUser.id.equals(targetId)) {
      return Promise.resolve(null);
    }
    return this.users.findById(targetId);
  }
}
