import { createAppContainer } from "./composition/container.ts";
import { createApp } from "./presentation/app.ts";

export const container = createAppContainer();

if (import.meta.main) {
  const app = await createApp(container);
  await app.listen({ port: 0, host: "127.0.0.1" });
  const addr = app.server.address();
  const port = typeof addr === "object" && addr !== null ? addr.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/users/user-1`, {
      headers: { "X-User-Id": "user-1" },
    });
    console.log("GET /users/user-1:", res.status, await res.json());
  } finally {
    await app.close();
  }
}
