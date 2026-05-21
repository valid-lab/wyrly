import { assertType, type IsExact } from "jsr:@std/testing@1/types";
import {
  type Container,
  createContainer,
  Injectable,
  type InjectionToken,
  type Token,
  token,
} from "./mod.ts";

interface User {
  id: string;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
}

const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({
  deps: [UserRepositoryToken],
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(id: string) {
    return this.users.findById(id);
  }
}

Deno.test("types: token() infers Token<T>", () => {
  const t = token<User>("User");
  assertType<IsExact<typeof t, Token<User>>>(true);
});

Deno.test("types: resolve(token) infers T", () => {
  const c = createContainer();
  c.register(UserRepositoryToken, {
    useValue: { findById: () => Promise.resolve({ id: "1" }) },
  });
  const repo = c.resolve(UserRepositoryToken);
  assertType<IsExact<typeof repo, UserRepository>>(true);
});

Deno.test("types: resolve(class) infers instance type", () => {
  const c = createContainer();
  c.register(UserRepositoryToken, {
    useValue: { findById: () => Promise.resolve({ id: "1" }) },
  });
  c.register(GetUserUseCase);
  const usecase = c.resolve(GetUserUseCase);
  assertType<IsExact<typeof usecase, GetUserUseCase>>(true);
});

Deno.test("types: Container and InjectionToken exports", () => {
  const c: Container = createContainer();
  const userTok = token<User>("User");
  const tok: InjectionToken<User> = userTok;
  assertType<IsExact<typeof c, Container>>(true);
  assertType<IsExact<typeof tok, Token<User>>>(true);
  assertType<IsExact<typeof userTok, Token<User>>>(true);
});
