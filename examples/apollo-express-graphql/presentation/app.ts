import { expressMiddleware } from "@apollo/server/express4";
import type { Container } from "@wyrly/core";
import { asExpressRequestWithDI, diMiddleware } from "@wyrly/express";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { CurrentUserToken } from "../composition/tokens.ts";
import { createApolloServer } from "./server.ts";

function mapCurrentUser(req: Request, _res: Response, next: NextFunction): void {
  const r = asExpressRequestWithDI(req);
  const userId = r.headers["x-user-id"];
  const id = typeof userId === "string" ? userId : "anonymous";
  r.di.set(CurrentUserToken, { id });
  next();
}

export async function createApp(container: Container): Promise<express.Application> {
  const app = express();
  const server = createApolloServer(container);
  await server.start();

  app.use(diMiddleware(container));
  app.use(mapCurrentUser);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        await Promise.resolve();
        return { req, res };
      },
    }),
  );

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
