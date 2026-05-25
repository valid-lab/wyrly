import { EventEmitter } from "node:events";
import { assert, assertEquals, assertThrows } from "jsr:@std/assert@1";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createContainer, Injectable, token } from "@wyrly/core";
import { diPlugin, FastifyRequestToken, getDI } from "./mod.ts";
import { registerDiHooks } from "./plugin.ts";

const PingToken = token<string>("Ping");

type HookName = "onRequest";
type OnRequestHook = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) => void;

function createMockFastify(): FastifyInstance & { onRequestHooks: OnRequestHook[] } {
  const onRequestHooks: OnRequestHook[] = [];
  return {
    onRequestHooks,
    addHook(name: HookName, hook: OnRequestHook) {
      if (name === "onRequest") onRequestHooks.push(hook);
    },
  } as FastifyInstance & { onRequestHooks: OnRequestHook[] };
}

function runOnRequestHooks(
  hooks: OnRequestHook[],
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  for (const hook of hooks) hook(request, reply, () => {});
}

function createReply(): FastifyReply {
  return { raw: new EventEmitter() } as FastifyReply;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

Deno.test("registerDiHooks attaches request.di and resolves tokens", () => {
  const container = createContainer();
  container.register(PingToken, { useValue: "pong", lifetime: "singleton" });

  const fastify = createMockFastify();
  registerDiHooks(fastify, container);

  const request = {} as FastifyRequest;
  const reply = createReply();
  runOnRequestHooks(fastify.onRequestHooks, request, reply);

  const di = getDI(request);
  assertEquals(di.resolve(PingToken), "pong");
  assertEquals(di.resolve(FastifyRequestToken), request);
});

Deno.test("registerDiHooks disposes scope on response finish", async () => {
  const container = createContainer();
  const log: string[] = [];

  @Injectable({ lifetime: "scoped" })
  class ScopedSvc {
    dispose() {
      log.push("disposed");
    }
  }
  container.register(ScopedSvc, { useClass: ScopedSvc, lifetime: "scoped" });

  const fastify = createMockFastify();
  registerDiHooks(fastify, container);

  const request = {} as FastifyRequest;
  const reply = createReply();
  runOnRequestHooks(fastify.onRequestHooks, request, reply);

  getDI(request).resolve(ScopedSvc);
  assertEquals(getDI(request).isDisposed(), false);

  reply.raw.emit("finish");
  await flushMicrotasks();
  assertEquals(log, ["disposed"]);
  assertEquals(getDI(request).isDisposed(), true);
});

Deno.test("registerDiHooks double dispose on finish and close is safe", async () => {
  const container = createContainer();
  let disposeCount = 0;

  @Injectable({ lifetime: "scoped" })
  class Counted {
    dispose() {
      disposeCount++;
    }
  }
  container.register(Counted, { useClass: Counted, lifetime: "scoped" });

  const fastify = createMockFastify();
  registerDiHooks(fastify, container);

  const request = {} as FastifyRequest;
  const reply = createReply();
  runOnRequestHooks(fastify.onRequestHooks, request, reply);

  getDI(request).resolve(Counted);
  reply.raw.emit("finish");
  reply.raw.emit("close");
  await flushMicrotasks();
  assertEquals(disposeCount, 1);
});

Deno.test("registerDiHooks reports async dispose errors", async () => {
  const container = createContainer();
  const errors: unknown[] = [];

  @Injectable({ lifetime: "scoped" })
  class FailingDisposable {
    async dispose() {
      await Promise.resolve();
      throw new Error("dispose failed");
    }
  }
  container.register(FailingDisposable, { useClass: FailingDisposable, lifetime: "scoped" });

  const fastify = createMockFastify();
  registerDiHooks(fastify, container, {
    onDisposeError(error: unknown) {
      errors.push(error);
    },
  });

  const request = {} as FastifyRequest;
  const reply = createReply();
  runOnRequestHooks(fastify.onRequestHooks, request, reply);

  getDI(request).resolve(FailingDisposable);
  reply.raw.emit("finish");
  await flushMicrotasks();
  assertEquals(errors.length, 1);
  assert(errors[0] instanceof Error);
  assertEquals((errors[0] as Error).message, "dispose failed");
});

Deno.test("diPlugin wraps registerDiHooks with fastify-plugin", async () => {
  const container = createContainer();
  const captured = createMockFastify();

  const plugin = diPlugin(container);
  await plugin(captured, {});

  assertEquals(captured.onRequestHooks.length, 1);
});

Deno.test("getDI throws when plugin is missing", () => {
  assertThrows(
    () => getDI({} as Parameters<typeof getDI>[0]),
    Error,
    "diPlugin",
  );
});
