/**
 * Compare Wyrly DI benchmark JSON output against committed CI baselines.
 *
 * Usage:
 *   deno run -A scripts/ci/check-di-bench.ts
 *   deno run -A scripts/ci/check-di-bench.ts --update-baseline
 *   deno run -A scripts/ci/check-di-bench.ts --report
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

interface SuiteMetric {
  suite: string;
  hz: number;
  minHz: number;
  marginPct: number;
}

function buildSuiteMetrics(
  measured: Map<string, number>,
  baseline: BaselineFile,
): SuiteMetric[] {
  const rows: SuiteMetric[] = [];
  for (const [suite, entry] of Object.entries(baseline.suites)) {
    const hz = measured.get(suite);
    if (hz === undefined) continue;
    const marginPct = ((hz - entry.minHz) / entry.minHz) * 100;
    rows.push({ suite, hz, minHz: entry.minHz, marginPct });
  }
  return rows;
}

async function reportMetrics(
  resultsPath: string,
  baselinePath: string,
): Promise<void> {
  const results = await readJson<BenchResultsFile>(resultsPath);
  const baseline = await readJson<BaselineFile>(baselinePath);
  const measured = wyrlyHzBySuite(results);
  const rows = buildSuiteMetrics(measured, baseline);

  if (rows.length === 0) {
    console.error("No wyrly suite metrics to report");
    Deno.exit(1);
  }

  const lines = [
    "## DI bench (wyrly) — measured hz",
    "",
    "| Suite | hz | minHz | margin vs min |",
    "|-------|-----|-------|---------------|",
    ...rows.map((r) =>
      `| ${r.suite} | ${formatHz(r.hz)} (${Math.round(r.hz)}) | ${
        formatHz(r.minHz)
      } (${r.minHz}) | ${r.marginPct >= 0 ? "+" : ""}${r.marginPct.toFixed(1)}% |`
    ),
    "",
    "_Copy `BENCH_GHA_METRICS` lines from job logs to track runner variance over time._",
  ];
  const markdown = lines.join("\n");
  console.log(markdown);

  const payload = {
    recordedAt: new Date().toISOString(),
    resultsPath,
    baselinePath,
    runner: Deno.env.get("RUNNER_OS") ?? undefined,
    suites: Object.fromEntries(
      rows.map((r) => [
        r.suite,
        {
          hz: Math.round(r.hz),
          minHz: r.minHz,
          marginPct: Number(r.marginPct.toFixed(2)),
        },
      ]),
    ),
  };
  console.log(`BENCH_GHA_METRICS ${JSON.stringify(payload)}`);

  const summaryPath = Deno.env.get("GITHUB_STEP_SUMMARY");
  if (summaryPath) {
    await Deno.writeTextFile(summaryPath, markdown + "\n", { append: true });
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
  reportOnly: boolean;
  results: string;
  baseline: string;
} {
  let help = false;
  let updateBaseline = false;
  let reportOnly = false;
  let results = DEFAULT_RESULTS;
  let baseline = DEFAULT_BASELINE;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (arg === "--report") {
      reportOnly = true;
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

  return { help, updateBaseline, reportOnly, results, baseline };
}

const cli = parseCli(Deno.args);

if (cli.help) {
  console.log(`Usage: deno run -A scripts/ci/check-di-bench.ts [options]

Options:
  --results <path>     Benchmark JSON (default: ${DEFAULT_RESULTS})
  --baseline <path>    Baseline JSON (default: ${DEFAULT_BASELINE})
  --update-baseline    Write minHz = measured × (1 - threshold) into baseline file
  --report             Print hz table + BENCH_GHA_METRICS JSON (no pass/fail)
  -h, --help           Show this help
`);
  Deno.exit(0);
}

if (cli.updateBaseline) {
  await updateBaseline(cli.results, cli.baseline);
} else if (cli.reportOnly) {
  await reportMetrics(cli.results, cli.baseline);
} else {
  await checkRegression(cli.results, cli.baseline);
}
