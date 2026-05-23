import { createAppContainer } from "./composition/container.ts";
import { createApp, listen } from "./presentation/app.ts";

export const container = createAppContainer();

const app = createApp(container);

if (import.meta.main) {
  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/users/user-1`, {
      headers: { "X-User-Id": "user-1" },
    });
    console.log("GET /users/user-1:", res.status, await res.json());
  } finally {
    await server.close();
  }
}
