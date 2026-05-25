import type { User, UserRepository } from "../domain/user.ts";

const STORE: Record<string, User> = {
  "user-1": { id: "user-1", name: "Alice" },
  "user-2": { id: "user-2", name: "Bob" },
};

export class InMemoryUserRepository implements UserRepository {
  findByIds(ids: string[]): Promise<User[]> {
    return Promise.resolve(ids.map((id) => STORE[id]).filter((u): u is User => u !== undefined));
  }
}
