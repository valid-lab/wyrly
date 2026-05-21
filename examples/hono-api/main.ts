import { createContainer } from "@wyrly/core";
import { GetUserUseCase } from "./application/get_user.ts";
import { InMemoryUserRepository } from "./infrastructure/in_memory_user_repo.ts";
import { UserRepositoryToken } from "./domain/user.ts";
import { createApp } from "./presentation/routes.ts";

export const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: InMemoryUserRepository,
  lifetime: "scoped",
});
container.register(GetUserUseCase);

const app = createApp(container);

if (import.meta.main) {
  const res = await app.request("/users/user-1", {
    headers: { "X-User-Id": "user-1" },
  });
  console.log("GET /users/user-1:", res.status, await res.json());

  const missing = await app.request("/users/unknown");
  console.log("GET /users/unknown:", missing.status, await missing.json());
}
