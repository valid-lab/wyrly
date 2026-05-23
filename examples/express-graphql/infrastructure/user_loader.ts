import type { Container } from "@wyrly/core";
import { token } from "@wyrly/core";
import type { User } from "../domain/user.ts";
import { GetUsersByIdsUseCase } from "../application/get_users.ts";

export interface UserLoader {
  load(id: string): Promise<User | null>;
}

export const UserLoaderToken = token<UserLoader>("UserLoader");

export function registerUserLoader(container: Container): void {
  container.register(UserLoaderToken, {
    lifetime: "scoped",
    deps: [GetUsersByIdsUseCase],
    useFactory: (_scope, getUsersByIds) => {
      const useCase = getUsersByIds as GetUsersByIdsUseCase;
      const cache = new Map<string, Promise<User | null>>();

      return {
        load(id: string): Promise<User | null> {
          let pending = cache.get(id);
          if (!pending) {
            pending = useCase.execute([id]).then((rows) => rows[0] ?? null);
            cache.set(id, pending);
          }
          return pending;
        },
      };
    },
  });
}
