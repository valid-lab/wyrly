import express from "express";
import type { NextFunction, Request, Response } from "express";
import type { Container } from "@wyrly/core";
import { diMiddleware } from "@wyrly/express";
import { GetUserUseCase } from "../application/get_user.ts";
import { CurrentUserToken } from "../domain/user.ts";

function mapCurrentUser(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers["x-user-id"];
  const id = typeof userId === "string" ? userId : "anonymous";
  req.di!.set(CurrentUserToken, { id });
  next();
}

export function createApp(container: Container): express.Application {
  const app = express();

  app.use(diMiddleware(container));
  app.use(mapCurrentUser);

  app.get("/users/:id", async (req, res) => {
    const useCase = req.di!.resolve(GetUserUseCase);
    const user = await useCase.execute(req.params.id);
    if (!user) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(user);
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
