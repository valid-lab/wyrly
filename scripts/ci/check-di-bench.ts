/**
 * Compare Wyrly DI benchmark JSON output against committed CI baselines.
 *
 * Usage:
 *   deno run -A scripts/ci/check-di-bench.ts
 *   deno run -A scripts/ci/check-di-bench.ts --update-baseline
 */

const DEFAULT_RESULTS = "benchmarks/di/results/benchmark-results.json";
const DEFAULT_BASELINE = "benchmarks/di/baselines/ci-wyrly.json";
const ADAPTER = "wyrly";

interface BenchRow {
  task: string;
  hz?: number;
}

interface BenchResultsFile {
  results: BenchRow[];
}

interface SuiteBaseline {
  minHz: number;
}

interface BaselineFile {
  threshold: number;
  note?: string;
  suites: Record<string, SuiteBaseline>;
}

function formatHz(hz: number): string {
  if (hz >= 1_000_000) return `${(hz / 1_000_000).toFixed(2)}M ops/s`;
  if (hz >= 1_000) return `${(hz / 1_000).toFixed(2)}K ops/s`;
  return `${hz.toFixed(2)} ops/s`;
}

function parseTaskName(task: string): { adapter: string; suite: string } | undefined {
  const slash = task.indexOf("/");
  if (slash === -1) return undefined;
  return { adapter: task.slice(0, slash), suite: task.slice(slash + 1) };
}

async function readJson<T>(path: string): Promise<T> {
  const text = await Deno.readTextFile(path);
  return JSON.parse(text) as T;
}

function wyrlyHzBySuite(results: BenchResultsFile): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of results.results) {
    const parsed = parseTaskName(row.task);
    if (!parsed || parsed.adapter !== ADAPTER) continue;
    if (row.hz === undefined || !Number.isFinite(row.hz)) continue;
    map.set(parsed.suite, row.hz);
  }
  return map;
}

async function updateBaseline(
  resultsPath: string,
  baselinePath: string,
): Promise<void> {
  const results = await readJson<BenchResultsFile>(resultsPath);
  const existing = await readJson<BaselineFile>(baselinePath);
  const measured = wyrlyHzBySuite(results);
  const suites: Record<string, SuiteBaseline> = {};

  for (const suite of Object.keys(existing.suites)) {
    const hz = measured.get(suite);
    if (hz === undefined) {
      console.error(`Missing wyrly/${suite} in ${resultsPath}`);
      Deno.exit(1);
    }
    const minHz = Math.floor(hz * (1 - existing.threshold));
    suites[suite] = { minHz };
  }

  const out: BaselineFile = {
    threshold: existing.threshold,
    note: existing.note,
    suites,
  };
  await Deno.writeTextFile(baselinePath, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `Updated ${baselinePath} from ${resultsPath} (minHz = measured × ${1 - existing.threshold}):`,
  );
  for (const [suite, entry] of Object.entries(suites)) {
    const hz = measured.get(suite)!;
    console.log(`  ${suite}: ${formatHz(hz)} → minHz ${entry.minHz}`);
  }
}

async function checkRegression(
  resultsPath: string,
  baselinePath: string,
): Promise<void> {
  const results = await readJson<BenchResultsFile>(resultsPath);
  const baseline = await readJson<BaselineFile>(baselinePath);
  const measured = wyrlyHzBySuite(results);

  const failures: Array<{
    suite: string;
    hz: number;
    minHz: number;
    pctBelow: number;
  }> = [];
  const ok: Array<{ suite: string; hz: number; minHz: number }> = [];

  for (const [suite, entry] of Object.entries(baseline.suites)) {
    const hz = measured.get(suite);
    if (hz === undefined) {
      console.error(`Missing benchmark result for wyrly/${suite}`);
      Deno.exit(1);
    }
    if (hz < entry.minHz) {
      failures.push({
        suite,
        hz,
        minHz: entry.minHz,
        pctBelow: ((entry.minHz - hz) / entry.minHz) * 100,
      });
    } else {
      ok.push({ suite, hz, minHz: entry.minHz });
    }
  }

  if (failures.length > 0) {
    console.error("DI benchmark regression (wyrly ops/s below CI baseline):\n");
    console.error("| Suite | measured | minHz | below min |");
    console.error("|-------|----------|-------|-----------|");
    for (const f of failures) {
      console.error(
        `| ${f.suite} | ${formatHz(f.hz)} | ${formatHz(f.minHz)} | ${f.pctBelow.toFixed(1)}% |`,
      );
    }
    console.error(
      `\nThreshold: measured hz must be >= minHz in ${baselinePath}.`,
    );
    console.error(
      "After intentional perf improvements, run: deno task bench:di:ci && deno run -A scripts/ci/check-di-bench.ts --update-baseline",
    );
    Deno.exit(1);
  }

  const parts = ok.map((r) => `${r.suite} ${formatHz(r.hz)} (min ${formatHz(r.minHz)})`);
  console.log(`DI bench OK: ${parts.join("; ")}`);
}

function parseCli(argv: string[]): {
  help: boolean;
  updateBaseline: boolean;
  results: string;
  baseline: string;
} {
  let help = false;
  let updateBaseline = false;
  let results = DEFAULT_RESULTS;
  let baseline = DEFAULT_BASELINE;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (arg === "--update-baseline") {
      updateBaseline = true;
      continue;
    }
    if (arg === "--results" && argv[i + 1]) {
      results = argv[++i]!;
      continue;
    }
    if (arg === "--baseline" && argv[i + 1]) {
      baseline = argv[++i]!;
      continue;
    }
  }

  return { help, updateBaseline, results, baseline };
}

const cli = parseCli(Deno.args);

if (cli.help) {
  console.log(`Usage: deno run -A scripts/ci/check-di-bench.ts [options]

Options:
  --results <path>     Benchmark JSON (default: ${DEFAULT_RESULTS})
  --baseline <path>    Baseline JSON (default: ${DEFAULT_BASELINE})
  --update-baseline    Write minHz = measured × (1 - threshold) into baseline file
  -h, --help           Show this help
`);
  Deno.exit(0);
}

if (cli.updateBaseline) {
  await updateBaseline(cli.results, cli.baseline);
} else {
  await checkRegression(cli.results, cli.baseline);
}
