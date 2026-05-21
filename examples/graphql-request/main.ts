import { createContainer } from "@wyrly/core";
import { GetUsersByIdsUseCase } from "./application/get_users.ts";
import { InMemoryUserRepository } from "./infrastructure/in_memory_user_repo.ts";
import { registerUserLoader } from "./infrastructure/user_loader.ts";
import { UserRepositoryToken } from "./domain/user.ts";
import { runGraphQLRequest } from "./presentation/resolvers.ts";

export const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: InMemoryUserRepository,
  lifetime: "scoped",
});
container.register(GetUsersByIdsUseCase);
registerUserLoader(container);

if (import.meta.main) {
  const user = await runGraphQLRequest(container, "user", {
    userId: "user-1",
    ids: ["user-1"],
  });
  console.log("user query:", user);

  const users = await runGraphQLRequest(container, "users", {
    userId: "user-1",
    ids: ["user-1", "user-2"],
  });
  console.log("users query:", users);
}
