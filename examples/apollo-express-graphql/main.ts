import { createAppContainer } from "./composition/container.ts";
import { createApp, listen } from "./presentation/app.ts";

const container = createAppContainer();
const app = await createApp(container);

if (import.meta.main) {
  const { port, close } = await listen(app);

  const health = await fetch(`http://127.0.0.1:${port}/health`);
  console.log("GET /health:", health.status, await health.json());

  const userRes = await fetch(`http://127.0.0.1:${port}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": "user-1",
    },
    body: JSON.stringify({
      query: `query User($id: ID!) { user(id: $id) { id name } }`,
      variables: { id: "user-1" },
    }),
  });
  console.log("POST /graphql (user):", userRes.status, await userRes.json());

  const usersRes = await fetch(`http://127.0.0.1:${port}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query Users($ids: [ID!]!) { users(ids: $ids) { id name } }`,
      variables: { ids: ["user-1", "user-2"] },
    }),
  });
  console.log("POST /graphql (users):", usersRes.status, await usersRes.json());

  await close();
}
