import { type User, UserId, type UserRepository } from "../domain/user.ts";

export class InMemoryUserRepository implements UserRepository {
  findById(id: UserId): Promise<User | null> {
    const users: Record<string, User> = {
      "user-1": { id: UserId.from("user-1"), name: "Alice" },
    };
    return Promise.resolve(users[id.toString()] ?? null);
  }
}
