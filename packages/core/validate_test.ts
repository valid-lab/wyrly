import { assert, assertEquals } from "jsr:@std/assert@1";
import { createContainer, Injectable, token } from "./mod.ts";

Deno.test("validate detects unresolved_dependency", () => {
  const c = createContainer();
  const Missing = token<string>("Missing");
  const Root = token<{ x: string }>("Root");
  c.register(Root, {
    deps: [Missing],
    useFactory: () => ({ x: "v" }),
    lifetime: "singleton",
  });
  const r = c.validate();
  assert(!r.ok);
  assert(r.issues.some((i) => i.code === "unresolved_dependency"));
});

Deno.test("validate detects unused_provider", () => {
  const c = createContainer();
  const Used = token<number>("Used");
  const Unused = token<number>("Unused");
  c.register(Used, { useValue: 1, lifetime: "singleton" });
  c.register(Unused, { useValue: 2, lifetime: "singleton" });
  @Injectable({ deps: [Used], lifetime: "singleton" })
  class Consumer {
    constructor(_u: number) {}
  }
  c.register(Consumer);
  const r = c.validate();
  assert(r.issues.some((i) => i.code === "unused_provider" && i.message.includes("Unused")));
});

Deno.test("validate messages are Japanese when locale is ja", () => {
  const c = createContainer();
  const Unused = token<number>("Unused");
  c.register(Unused, { useValue: 2, lifetime: "singleton" });
  const r = c.validate({ locale: "ja" });
  const issue = r.issues.find((i) => i.code === "unused_provider");
  assert(issue !== undefined);
  assert(issue.message.includes("未使用"));
});

Deno.test("validate ok for healthy container", () => {
  const c = createContainer();
  const T = token<number>("T");
  c.register(T, { useValue: 1, lifetime: "singleton" });
  const r = c.validate();
  assertEquals(r.ok, true);
});
