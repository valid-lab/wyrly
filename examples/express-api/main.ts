import { createContainer } from "@wyrly/core";
import { GetUserUseCase } from "./application/get_user.ts";
import { InMemoryUserRepository } from "./infrastructure/in_memory_user_repo.ts";
import { UserRepositoryToken } from "./domain/user.ts";
import { createApp, listen } from "./presentation/app.ts";

export const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: InMemoryUserRepository,
  lifetime: "scoped",
});
container.register(GetUserUseCase);

const app = createApp(container);

if (import.meta.main) {
  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/users/user-1`, {
      headers: { "X-User-Id": "user-1" },
    });
    console.log("GET /users/user-1:", res.status, await res.json());
  } finally {
    await server.close();
  }
}
