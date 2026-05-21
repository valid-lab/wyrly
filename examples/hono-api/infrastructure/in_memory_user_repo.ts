import type { User, UserRepository } from "../domain/user.ts";

export class InMemoryUserRepository implements UserRepository {
  findById(id: string): Promise<User | null> {
    const users: Record<string, User> = {
      "user-1": { id: "user-1", name: "Alice" },
      "user-2": { id: "user-2", name: "Bob" },
    };
    return Promise.resolve(users[id] ?? null);
  }
}
