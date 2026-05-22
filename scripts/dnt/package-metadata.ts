/** Package ids in the monorepo (fresh is JSR-only, not published to npm). */
export type PackageId = "core" | "express" | "hono" | "graphql" | "next" | "fresh";

const REPO = "https://github.com/valid-lab/wyrly";
const BUGS = `${REPO}/issues`;

const COMMON_KEYWORDS = [
  "wyrly",
  "dependency-injection",
  "di",
  "typescript",
  "inversion-of-control",
  "ioc",
] as const;

export interface PackageMetadata {
  id: PackageId;
  npmName: string;
  description: string;
  keywords: string[];
  homepage: string;
  bugs: string;
  /** Published to registry.npmjs.org */
  npm: boolean;
}

function homepage(id: PackageId): string {
  return `${REPO}/tree/main/packages/${id}`;
}

export const PACKAGE_METADATA: Record<PackageId, PackageMetadata> = {
  core: {
    id: "core",
    npmName: "@wyrly/core",
    description:
      "Explicit DI for modern TypeScript — typed tokens, standard decorators, request scopes",
    keywords: [
      ...COMMON_KEYWORDS,
      "deno",
      "jsr",
      "decorators",
      "clean-architecture",
      "ddd",
      "scoped",
      "container",
    ],
    homepage: homepage("core"),
    bugs: BUGS,
    npm: true,
  },
  express: {
    id: "express",
    npmName: "@wyrly/express",
    description: "Wyrly DI adapter for Express — request scope via diMiddleware",
    keywords: [
      ...COMMON_KEYWORDS,
      "express",
      "middleware",
      "node",
      "http",
    ],
    homepage: homepage("express"),
    bugs: BUGS,
    npm: true,
  },
  hono: {
    id: "hono",
    npmName: "@wyrly/hono",
    description: "Wyrly DI adapter for Hono — request scope via di() middleware",
    keywords: [
      ...COMMON_KEYWORDS,
      "hono",
      "middleware",
      "bun",
      "cloudflare-workers",
      "edge",
    ],
    homepage: homepage("hono"),
    bugs: BUGS,
    npm: true,
  },
  graphql: {
    id: "graphql",
    npmName: "@wyrly/graphql",
    description: "Wyrly DI adapter for GraphQL — one scope per request via createGraphQLDIContext",
    keywords: [
      ...COMMON_KEYWORDS,
      "graphql",
      "request-scope",
      "context",
    ],
    homepage: homepage("graphql"),
    bugs: BUGS,
    npm: true,
  },
  next: {
    id: "next",
    npmName: "@wyrly/next",
    description: "Wyrly DI adapter for Next.js App Router — withDI and createServerDI",
    keywords: [
      ...COMMON_KEYWORDS,
      "nextjs",
      "next.js",
      "app-router",
      "react",
      "server-components",
    ],
    homepage: homepage("next"),
    bugs: BUGS,
    npm: true,
  },
  fresh: {
    id: "fresh",
    npmName: "@wyrly/fresh",
    description: "Wyrly DI adapter for Fresh 2.x — di() middleware and withDI (JSR only)",
    keywords: [
      ...COMMON_KEYWORDS,
      "fresh",
      "deno",
      "jsr",
      "middleware",
    ],
    homepage: homepage("fresh"),
    bugs: BUGS,
    npm: false,
  },
};

export const ALL_PACKAGE_IDS: PackageId[] = [
  "core",
  "express",
  "hono",
  "graphql",
  "next",
  "fresh",
];

export function getPackageMetadata(id: PackageId): PackageMetadata {
  return PACKAGE_METADATA[id];
}
