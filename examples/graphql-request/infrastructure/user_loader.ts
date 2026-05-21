import type { Container } from "@wyrly/core";
import { token } from "@wyrly/core";
import type { User } from "../domain/user.ts";
import { GetUsersByIdsUseCase } from "../application/get_users.ts";

export interface UserLoader {
  load(id: string): Promise<User | null>;
}

export const UserLoaderToken = token<UserLoader>("UserLoader");

/** Scoped factory: one GraphQL request = one DataLoader-style batch cache */
export function registerUserLoader(container: Container): void {
  container.register(UserLoaderToken, {
    lifetime: "scoped",
    useFactory: (scope) => {
      const cache = new Map<string, Promise<User | null>>();
      const useCase = scope.resolve(GetUsersByIdsUseCase);

      const loadBatch = async (ids: string[]): Promise<(User | null)[]> => {
        const users = await useCase.execute(ids);
        const byId = new Map(users.map((u) => [u.id, u]));
        return ids.map((id) => byId.get(id) ?? null);
      };

      return {
        load(id: string): Promise<User | null> {
          let pending = cache.get(id);
          if (!pending) {
            pending = loadBatch([id]).then((rows) => rows[0] ?? null);
            cache.set(id, pending);
          }
          return pending;
        },
      };
    },
  });
}
