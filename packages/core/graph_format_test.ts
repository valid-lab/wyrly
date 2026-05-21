import { assert, assertEquals } from "jsr:@std/assert@1";
import type { DependencyGraph } from "./graph.ts";
import { graphToDot, graphToJson, graphToMermaid } from "./graph_format.ts";

const sampleGraph: DependencyGraph = {
  nodes: [
    { id: "A", name: "A", lifetime: "singleton", provider: "value" },
    { id: "B", name: "B", lifetime: "scoped", provider: "class" },
  ],
  edges: [{ from: "B", to: "A" }],
};

Deno.test("graphToJson serializes graph", () => {
  const json = graphToJson(sampleGraph);
  const parsed = JSON.parse(json) as DependencyGraph;
  assertEquals(parsed.nodes.length, 2);
  assertEquals(parsed.edges[0]?.from, "B");
});

Deno.test("graphToDot produces digraph", () => {
  const dot = graphToDot(sampleGraph);
  assert(dot.includes("digraph DependencyGraph"));
  assert(dot.includes('"B"'));
  assert(dot.includes("->"));
});

Deno.test("graphToMermaid produces flowchart", () => {
  const mermaid = graphToMermaid(sampleGraph);
  assert(mermaid.includes("flowchart TD"));
  assert(mermaid.includes("B --> A") || mermaid.includes("B_ --> A"));
});
