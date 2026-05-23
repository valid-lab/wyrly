import { createAppContainer } from "./composition/container.ts";
import { createApp, listen } from "./presentation/app.ts";

export const container = createAppContainer();

const app = createApp(container);

if (import.meta.main) {
  const server = await listen(app);
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": "user-1",
      },
      body: JSON.stringify({ operation: "users", ids: ["user-1", "user-2"] }),
    });
    console.log("POST /graphql:", res.status, await res.json());
  } finally {
    await server.close();
  }
}
