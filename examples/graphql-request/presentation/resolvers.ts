import type { Container } from "@wyrly/core";
import { createGraphQLDIContext } from "@wyrly/graphql";
import { CurrentUserToken } from "../composition/tokens.ts";
import { UserLoaderToken } from "../infrastructure/user_loader.ts";

export type GraphQLOperation = "user" | "users";

export async function runGraphQLRequest(
  container: Container,
  operation: GraphQLOperation,
  options: { userId?: string; ids?: string[] } = {},
): Promise<unknown> {
  const request = new Request("https://example.com/graphql", {
    method: "POST",
    headers: options.userId ? { "X-User-Id": options.userId } : {},
    body: JSON.stringify({ operation, ...options }),
  });

  const ctx = await createGraphQLDIContext(container, {
    request,
    configureScope(scope) {
      const headerUser = request.headers.get("X-User-Id");
      if (headerUser) {
        scope.set(CurrentUserToken, { id: headerUser });
      }
    },
  });

  try {
    const loader = ctx.di.resolve(UserLoaderToken);

    if (operation === "user") {
      const id = options.ids?.[0] ?? "user-1";
      return await loader.load(id);
    }

    const ids = options.ids ?? ["user-1", "user-2"];
    return await Promise.all(ids.map((id) => loader.load(id)));
  } finally {
    await ctx.dispose();
  }
}
