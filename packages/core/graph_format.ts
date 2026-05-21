import type { DependencyGraph, DependencyNode } from "./graph.ts";

export interface GraphToJsonOptions {
  indent?: number;
}

function escapeDotId(id: string): string {
  return JSON.stringify(id);
}

function escapeMermaidId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function nodeLabel(node: DependencyNode): string {
  return `${node.name} (${node.lifetime})`;
}

/**
 * Serializes the dependency graph to a JSON string.
 */
export function graphToJson(
  graph: DependencyGraph,
  options: GraphToJsonOptions = {},
): string {
  const indent = options.indent ?? 2;
  return JSON.stringify(graph, null, indent);
}

/**
 * Converts the dependency graph to Graphviz DOT format.
 */
export function graphToDot(graph: DependencyGraph): string {
  const lines: string[] = ["digraph DependencyGraph {", '  rankdir="LR";'];
  for (const node of graph.nodes) {
    const id = escapeDotId(node.id);
    const label = JSON.stringify(nodeLabel(node));
    lines.push(`  ${id} [label=${label}];`);
  }
  for (const edge of graph.edges) {
    lines.push(`  ${escapeDotId(edge.from)} -> ${escapeDotId(edge.to)};`);
  }
  lines.push("}");
  return lines.join("\n");
}

/**
 * Converts the dependency graph to Mermaid flowchart format.
 */
export function graphToMermaid(graph: DependencyGraph): string {
  const lines: string[] = ["flowchart TD"];
  for (const node of graph.nodes) {
    const id = escapeMermaidId(node.id);
    const label = nodeLabel(node).replace(/"/g, "'");
    lines.push(`  ${id}["${label}"]`);
  }
  for (const edge of graph.edges) {
    const from = escapeMermaidId(edge.from);
    const to = escapeMermaidId(edge.to);
    lines.push(`  ${from} --> ${to}`);
  }
  return lines.join("\n");
}
