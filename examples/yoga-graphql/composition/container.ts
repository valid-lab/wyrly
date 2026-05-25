import { type Container, createContainer } from "@wyrly/core";
import { GetUsersByIdsUseCase } from "../application/get_users.ts";
import { InMemoryUserRepository } from "../infrastructure/in_memory_user_repo.ts";
import { registerUserLoader } from "../infrastructure/user_loader.ts";
import { UserRepositoryToken } from "./tokens.ts";

export function configureContainer(container: Container): Container {
  container.register(UserRepositoryToken, {
    useClass: InMemoryUserRepository,
    lifetime: "scoped",
  });
  container.register(GetUsersByIdsUseCase, {
    useClass: GetUsersByIdsUseCase,
    deps: [UserRepositoryToken],
    lifetime: "scoped",
  });
  registerUserLoader(container);
  return container;
}

export function createAppContainer(): Container {
  return configureContainer(createContainer());
}
