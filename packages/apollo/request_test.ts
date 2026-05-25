import { assertEquals } from "jsr:@std/assert@1";
import { toFetchRequest } from "./request.ts";

Deno.test("toFetchRequest builds URL and headers from Node-like req", () => {
  const request = toFetchRequest({
    method: "POST",
    url: "/graphql",
    headers: { "X-User-Id": "alice", "Content-Type": "application/json" },
  });
  assertEquals(request.method, "POST");
  assertEquals(request.url, "http://127.0.0.1/graphql");
  assertEquals(request.headers.get("x-user-id"), "alice");
});
