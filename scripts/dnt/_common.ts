import { build, emptyDir } from "@deno/dnt";
import * as path from "@std/path";

const OSS_ROOT = path.dirname(path.dirname(path.dirname(path.fromFileUrl(import.meta.url))));

/** Packages published to npm via dnt (`@wyrly/fresh` is JSR-only — Fresh has no npm distribution). */
export type NpmPackageId = "core" | "express" | "hono" | "graphql" | "next";

export const NPM_PACKAGE_ORDER: NpmPackageId[] = [
  "core",
  "express",
  "hono",
  "graphql",
  "next",
];

export interface PackageBuildConfig {
  id: NpmPackageId;
  npmName: string;
  description: string;
  dntConfigFile?: string;
  peerDependencies?: Record<string, string>;
  extraMappings?: Record<string, string | { name: string; version: string; subPath?: string }>;
}

export const PACKAGE_CONFIGS: Record<NpmPackageId, PackageBuildConfig> = {
  core: {
    id: "core",
    npmName: "@wyrly/core",
    description: "Explicit DI for modern TypeScript (core)",
  },
  express: {
    id: "express",
    npmName: "@wyrly/express",
    description: "Wyrly DI adapter for Express",
    dntConfigFile: "pkg.express.json",
    peerDependencies: { express: "^5.0.0" },
  },
  hono: {
    id: "hono",
    npmName: "@wyrly/hono",
    description: "Wyrly DI adapter for Hono",
    dntConfigFile: "pkg.hono.json",
    peerDependencies: { hono: "^4.0.0" },
  },
  graphql: {
    id: "graphql",
    npmName: "@wyrly/graphql",
    description: "Wyrly DI adapter for GraphQL",
    dntConfigFile: "pkg.graphql.json",
  },
  next: {
    id: "next",
    npmName: "@wyrly/next",
    description: "Wyrly DI adapter for Next.js App Router",
    dntConfigFile: "pkg.next.json",
    peerDependencies: {
      next: "^15.0.0",
      react: "^19.0.0",
    },
    extraMappings: {
      "npm:next@15/server.js": {
        name: "next",
        version: "^15.0.0",
        subPath: "server.js",
      },
    },
  },
};

export async function readPackageVersion(id: NpmPackageId): Promise<string> {
  const denoJsonPath = path.join(OSS_ROOT, "packages", id, "deno.json");
  const json = JSON.parse(await Deno.readTextFile(denoJsonPath)) as { version: string };
  return json.version;
}

export function packageDir(id: NpmPackageId): string {
  return path.join(OSS_ROOT, "packages", id);
}

export async function buildNpmPackage(config: PackageBuildConfig): Promise<void> {
  const version = await readPackageVersion(config.id);
  const dir = packageDir(config.id);
  const outDir = path.join(dir, "npm");
  const coreDir = packageDir("core");

  await emptyDir(outDir);

  const mappings: Record<string, string | { name: string; version: string; subPath?: string }> = {
    ...config.extraMappings,
  };

  const dntDir = path.join(OSS_ROOT, "scripts", "dnt");
  const importMapPath = path.join(dntDir, "import_map.npm.json");
  const importMap: { imports: Record<string, string> } = { imports: {} };
  if (config.dntConfigFile) {
    const dntPkg = JSON.parse(
      await Deno.readTextFile(path.join(dntDir, config.dntConfigFile)),
    ) as { imports?: Record<string, string> };
    if (dntPkg.imports) Object.assign(importMap.imports, dntPkg.imports);
  }
  if (config.id !== "core") {
    const coreNpm = path.join(coreDir, "npm");
    try {
      await Deno.stat(path.join(coreNpm, "package.json"));
    } catch {
      throw new Error(
        `Build @wyrly/core npm first (missing ${coreNpm}). Run: deno run -A scripts/dnt/build.ts core`,
      );
    }
    importMap.imports["@wyrly/core"] = path.toFileUrl(path.join(coreDir, "mod.ts")).href;
  }
  await Deno.writeTextFile(importMapPath, JSON.stringify(importMap, null, 2) + "\n");

  const entryPoint = path.join(dir, "mod.ts");
  const outDirRel = "./npm";

  const prev = Deno.cwd();
  try {
    Deno.chdir(dir);

    await build({
      entryPoints: [entryPoint],
      outDir: outDirRel,
      typeCheck: false,
      test: false,
      scriptModule: false,
      shims: { deno: false },
      importMap: path.toFileUrl(importMapPath).href,
      configFile: path.toFileUrl(
        config.dntConfigFile
          ? path.join(dntDir, config.dntConfigFile)
          : path.join(dir, "deno.json"),
      ).href,
      package: {
        name: config.npmName,
        version,
        description: config.description,
        license: "Apache-2.0",
        sideEffects: false,
        repository: {
          type: "git",
          url: "git+https://github.com/valid-lab/wyrly.git",
          directory: `packages/${config.id}`,
        },
        ...(config.id !== "core"
          ? {
            dependencies: {
              "@wyrly/core": `file:${path.relative(dir, path.join(coreDir, "npm"))}`,
            },
          }
          : {}),
        ...(config.peerDependencies ? { peerDependencies: config.peerDependencies } : {}),
      },
      mappings,
      postBuild() {
        const license = path.join(OSS_ROOT, "LICENSE");
        Deno.copyFileSync(license, path.join(outDir, "LICENSE"));

        const pkgJsonPath = path.join(outDir, "package.json");
        const pkg = JSON.parse(Deno.readTextFileSync(pkgJsonPath)) as {
          dependencies?: Record<string, string>;
        };
        if (pkg.dependencies?.["@wyrly/core"]?.startsWith("file:")) {
          pkg.dependencies["@wyrly/core"] = `^${version}`;
          Deno.writeTextFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
        }
      },
    });
  } finally {
    Deno.chdir(prev);
  }

  console.log(`[dnt] Built ${config.npmName}@${version} -> ${outDir}`);
}
