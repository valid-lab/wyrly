import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bench } from "tinybench";
import { getAdapters } from "./adapters/index.ts";
import {
  ADAPTER_NAMES,
  isAdapterName,
  isSuiteName,
  SUITE_NAMES,
  type AdapterName,
  type SuiteName,
} from "./adapters/types.ts";
import { registerSuiteTasks } from "./suites/tasks.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface CliOptions {
  suites: SuiteName[];
  adapters: AdapterName[];
  json: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  let suites: SuiteName[] = [...SUITE_NAMES];
  let adapters: AdapterName[] = [...ADAPTER_NAMES];
  let json = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--suite" && argv[i + 1]) {
      suites = argv[++i]!.split(",").filter(isSuiteName);
      continue;
    }
    if (arg === "--adapter" && argv[i + 1]) {
      adapters = argv[++i]!.split(",").filter(isAdapterName);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { suites, adapters, json };
}

function printHelp(): void {
  console.log(`Usage: npm run bench -- [options]

Options:
  --suite <names>     Comma-separated suites (${SUITE_NAMES.join(", ")})
  --adapter <names>   Comma-separated adapters (${ADAPTER_NAMES.join(", ")})
  --json              Write results/benchmark-results.json
  -h, --help          Show this help
`);
}

function formatOpsPerSec(hz: number | undefined): string {
  if (hz === undefined || !Number.isFinite(hz)) return "n/a";
  if (hz >= 1_000_000) return `${(hz / 1_000_000).toFixed(2)}M ops/s`;
  if (hz >= 1_000) return `${(hz / 1_000).toFixed(2)}K ops/s`;
  return `${hz.toFixed(2)} ops/s`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const selectedAdapters = getAdapters(options.adapters);

  console.log("Wyrly DI — dependency injection benchmarks");
  console.log(`Suites:   ${options.suites.join(", ")}`);
  console.log(`Adapters: ${selectedAdapters.map((a) => a.name).join(", ")}`);
  if (options.suites.includes("resolution")) {
    console.log("Note:     resolution runs 100 root resolves per timed iteration");
  }
  console.log("");

  const bench = new Bench({ time: 1000, warmupTime: 500 });

  for (const suite of options.suites) {
    for (const adapter of selectedAdapters) {
      registerSuiteTasks(bench, suite, adapter.name);
    }
  }

  await bench.run();

  console.log("\nResults (higher ops/s = faster):\n");
  console.log(
    "| Task | ops/s | avg (ms) | p75 (ms) | p99 (ms) | samples |",
  );
  console.log(
    "|------|-------|----------|----------|----------|---------|",
  );

  const rows: Array<Record<string, unknown>> = [];

  for (const task of bench.tasks) {
    const result = task.result;
    const hz = result?.hz;
    const mean = result?.mean;
    const p75 = result?.p75;
    const p99 = result?.p99;
    const samples = result?.samples?.length ?? 0;

    console.log(
      `| ${task.name} | ${formatOpsPerSec(hz)} | ${
        mean !== undefined ? (mean * 1000).toFixed(4) : "n/a"
      } | ${p75 !== undefined ? (p75 * 1000).toFixed(4) : "n/a"} | ${
        p99 !== undefined ? (p99 * 1000).toFixed(4) : "n/a"
      } | ${samples} |`,
    );

    rows.push({
      task: task.name,
      hz,
      meanMs: mean !== undefined ? mean * 1000 : undefined,
      p75Ms: p75 !== undefined ? p75 * 1000 : undefined,
      p99Ms: p99 !== undefined ? p99 * 1000 : undefined,
      samples,
    });
  }

  if (options.json) {
    const resultsDir = join(__dirname, "results");
    mkdirSync(resultsDir, { recursive: true });
    const outPath = join(resultsDir, "benchmark-results.json");
    writeFileSync(
      outPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          suites: options.suites,
          adapters: options.adapters,
          results: rows,
        },
        null,
        2,
      ),
    );
    console.log(`\nJSON written to ${outPath}`);
  }

  console.log(
    "\nNote: Results are machine-dependent. DI resolve is rarely an app bottleneck.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
