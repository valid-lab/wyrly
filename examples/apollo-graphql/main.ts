import { createAppContainer } from "./composition/container.ts";
import { createApolloServer, createRequestContext } from "./presentation/server.ts";

const container = createAppContainer();
const server = createApolloServer(container);

if (import.meta.main) {
  const userResult = await server.executeOperation(
    {
      query: `query User($id: ID!) { user(id: $id) { id name } }`,
      variables: { id: "user-1" },
    },
    { contextValue: await createRequestContext(container, { userId: "user-1" }) },
  );
  console.log(
    "user:",
    userResult.body.kind === "single" ? userResult.body.singleResult.data : userResult,
  );

  const usersResult = await server.executeOperation(
    {
      query: `query Users($ids: [ID!]!) { users(ids: $ids) { id name } }`,
      variables: { ids: ["user-1", "user-2"] },
    },
    { contextValue: await createRequestContext(container) },
  );
  console.log(
    "users:",
    usersResult.body.kind === "single" ? usersResult.body.singleResult.data : usersResult,
  );
}
