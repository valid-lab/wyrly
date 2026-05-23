import { createAppContainer } from "./composition/container.ts";
import { runGraphQLRequest } from "./presentation/resolvers.ts";

export const container = createAppContainer();

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
