import { createContainer } from "@wyrly/core";
import type { Context } from "fresh";
import { GetUserUseCase } from "./application/get_user.ts";
import { InMemoryUserRepository } from "./infrastructure/in_memory_user_repo.ts";
import { UserRepositoryToken } from "./domain/user.ts";
import { createMiddlewareHandler, createWithDIHandler } from "./presentation/app.ts";
import type { FreshDIState } from "@wyrly/fresh";

export const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: InMemoryUserRepository,
  lifetime: "scoped",
});
container.register(GetUserUseCase);

function testContext(
  url: string,
  params: Record<string, string> = {},
): Context<FreshDIState> {
  return {
    req: new Request(url),
    params,
    state: { di: undefined! },
    url,
    next: () => Promise.resolve(new Response()),
  } as unknown as Context<FreshDIState>;
}

if (import.meta.main) {
  const headers = { "X-User-Id": "user-1" };

  const mwHandler = createMiddlewareHandler(container);
  const mw = await mwHandler(
    new Request("http://localhost/users/user-1", { headers }),
  );
  console.log("di() middleware:", mw.status, await mw.json());

  const withDi = createWithDIHandler(container);
  const res = await withDi(
    testContext("http://localhost/users/user-1", { id: "user-1" }),
  );
  console.log("withDI():", (res as Response).status, await (res as Response).json());
}
