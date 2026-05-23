import { createAppContainer } from "./composition/container.ts";
import { createApp } from "./presentation/routes.ts";

export const container = createAppContainer();

const app = createApp(container);

if (import.meta.main) {
  const res = await app.request("/users/user-1", {
    headers: { "X-User-Id": "user-1" },
  });
  console.log("GET /users/user-1:", res.status, await res.json());

  const missing = await app.request("/users/unknown");
  console.log("GET /users/unknown:", missing.status, await missing.json());
}
