import { createContainer, Injectable, token } from "@wyrly/core";

interface User {
  id: string;
  name: string;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
}

const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(id: string) {
    return this.users.findById(id);
  }
}

class InMemoryUserRepository implements UserRepository {
  findById(id: string): Promise<User | null> {
    return Promise.resolve({ id, name: `User ${id}` });
  }
}

const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: InMemoryUserRepository,
  lifetime: "scoped",
});

container.register(GetUserUseCase);

const scope = container.createScope();

try {
  const usecase = scope.resolve(GetUserUseCase);
  const user = await usecase.execute("user-1");
  console.log("resolved user:", user);
} finally {
  await scope.dispose();
}
