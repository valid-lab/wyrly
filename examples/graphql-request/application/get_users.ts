import { Injectable } from "@wyrly/core";
import type { User } from "../domain/user.ts";
import { type UserRepository, UserRepositoryToken } from "../domain/user.ts";

@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
export class GetUsersByIdsUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(ids: string[]): Promise<User[]> {
    return this.users.findByIds(ids);
  }
}
