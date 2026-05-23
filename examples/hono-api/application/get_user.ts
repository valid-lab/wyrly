import type { UserRepository } from "../domain/user.ts";

export interface CurrentUser {
  id: string;
}

export class GetUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  execute(targetId: string) {
    if (this.currentUser.id !== targetId) {
      return Promise.resolve(null);
    }
    return this.users.findById(targetId);
  }
}
