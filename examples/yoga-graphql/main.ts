import { createAppContainer } from "./composition/container.ts";
import { createYogaServer } from "./presentation/server.ts";

const container = createAppContainer();
const yoga = createYogaServer(container);

if (import.meta.main) {
  const userRes = await yoga.fetch("http://127.0.0.1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": "user-1" },
    body: JSON.stringify({
      query: `query { user(id: "user-1") { id name } }`,
    }),
  });
  console.log("user:", await userRes.json());

  const usersRes = await yoga.fetch("http://127.0.0.1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query { users(ids: ["user-1", "user-2"]) { id name } }`,
    }),
  });
  console.log("users:", await usersRes.json());
}
