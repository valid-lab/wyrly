import type { User } from "../domain/user.ts";
import type { UserRepository } from "../domain/user.ts";

export class GetUsersByIdsUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(ids: string[]): Promise<User[]> {
    return this.users.findByIds(ids);
  }
}
