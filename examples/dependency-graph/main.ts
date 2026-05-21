import { createContainer, graphToDot, graphToMermaid, Injectable, token } from "@wyrly/core";

const ConfigToken = token<{ prefix: string }>("Config");

@Injectable({ deps: [ConfigToken], lifetime: "singleton" })
class Greeter {
  constructor(private readonly config: { prefix: string }) {}

  greet(name: string): string {
    return `${this.config.prefix} ${name}`;
  }
}

@Injectable({ deps: [Greeter], lifetime: "scoped" })
class AppService {
  constructor(private readonly greeter: Greeter) {}

  run(name: string): string {
    return this.greeter.greet(name);
  }
}

export const container = createContainer();

container.register(ConfigToken, {
  useValue: { prefix: "Hello," },
  lifetime: "singleton",
});

container.register(Greeter);
container.register(AppService);

if (import.meta.main) {
  const graph = container.inspect();
  console.log("inspect nodes:", graph.nodes.length);
  console.log("inspect edges:", graph.edges.length);
  for (const edge of graph.edges) {
    console.log(`  ${edge.from} -> ${edge.to}`);
  }

  console.log("\n--- Mermaid ---\n");
  console.log(graphToMermaid(graph));

  console.log("\n--- DOT ---\n");
  console.log(graphToDot(graph));

  const validation = container.validate();
  console.log("\nvalidate ok:", validation.ok);
  if (!validation.ok) {
    for (const issue of validation.issues) {
      console.log(`  [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
  }
}
