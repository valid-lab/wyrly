import express from "express";
import type { Container } from "@wyrly/core";
import { createGraphQLDIContext } from "@wyrly/graphql";
import { CurrentUserToken } from "../domain/user.ts";
import { UserLoaderToken } from "../infrastructure/user_loader.ts";

type GraphQLBody = { operation?: string; ids?: string[] };

export function createApp(container: Container): express.Application {
  const app = express();
  app.use(express.json());

  app.post("/graphql", async (req, res) => {
    const body = req.body as GraphQLBody;
    const operation = body.operation ?? "user";
    const ids = body.ids ?? (operation === "users" ? ["user-1", "user-2"] : ["user-1"]);

    const request = new Request(`http://127.0.0.1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(typeof req.headers["x-user-id"] === "string"
          ? { "X-User-Id": req.headers["x-user-id"] }
          : {}),
      },
      body: JSON.stringify(body),
    });

    const ctx = await createGraphQLDIContext(container, {
      request,
      response: new Response(),
      configureScope(scope) {
        const headerUser = req.headers["x-user-id"];
        const id = typeof headerUser === "string" ? headerUser : "anonymous";
        scope.set(CurrentUserToken, { id });
      },
    });

    try {
      const loader = ctx.di.resolve(UserLoaderToken);
      if (operation === "users") {
        const users = await Promise.all(ids.map((id) => loader.load(id)));
        res.json({ data: { users } });
        return;
      }
      const user = await loader.load(ids[0] ?? "user-1");
      res.json({ data: { user } });
    } finally {
      await ctx.dispose();
    }
  });

  return app;
}

export interface TestServer {
  port: number;
  close(): Promise<void>;
}

export function listen(app: express.Application): Promise<TestServer> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (addr === null || typeof addr === "string") {
        reject(new Error("unexpected listen address"));
        return;
      }
      resolve({
        port: addr.port,
        close: () =>
          new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });
    server.on("error", reject);
  });
}
