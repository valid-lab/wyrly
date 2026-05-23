import { type Container, createContainer } from "@wyrly/core";
import { GetUserUseCase } from "../application/get_user.ts";
import { InMemoryUserRepository } from "../infrastructure/in_memory_user_repo.ts";
import { CurrentUserToken, UserRepositoryToken } from "./tokens.ts";

export function configureContainer(container: Container): Container {
  container.register(UserRepositoryToken, {
    useClass: InMemoryUserRepository,
    lifetime: "scoped",
  });
  container.register(GetUserUseCase, {
    useClass: GetUserUseCase,
    deps: [UserRepositoryToken, CurrentUserToken],
    lifetime: "scoped",
  });
  return container;
}

export function createAppContainer(): Container {
  return configureContainer(createContainer());
}
