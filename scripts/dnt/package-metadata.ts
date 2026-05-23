/** Package ids in the monorepo (fresh is JSR-only, not published to npm). */
export type PackageId = "core" | "express" | "hono" | "graphql" | "next" | "fresh";

const REPO = "https://github.com/valid-lab/wyrly";
const BUGS = `${REPO}/issues`;

const COMMON_KEYWORDS = [
  "wyrly",
  "dependency-injection",
  "di",
  "typescript",
  "standard-decorators",
  "decorators",
  "reflect-metadata",
  "no-reflect-metadata",
  "request-scope",
  "scoped",
  "clean-architecture",
  "ddd",
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
    description: "Type-safe dependency injection for modern TypeScript without reflect-metadata",
    keywords: [
      ...COMMON_KEYWORDS,
      "deno",
      "jsr",
      "bun",
      "workers",
      "container",
      "dependency-graph",
    ],
    homepage: homepage("core"),
    bugs: BUGS,
    npm: true,
  },
  express: {
    id: "express",
    npmName: "@wyrly/express",
    description: "Request-scoped dependency injection adapter for Express and TypeScript",
    keywords: [
      ...COMMON_KEYWORDS,
      "express",
      "middleware",
      "node",
      "nodejs",
      "http",
    ],
    homepage: homepage("express"),
    bugs: BUGS,
    npm: true,
  },
  hono: {
    id: "hono",
    npmName: "@wyrly/hono",
    description: "Request-scoped dependency injection adapter for Hono, Workers, and TypeScript",
    keywords: [
      ...COMMON_KEYWORDS,
      "hono",
      "middleware",
      "deno",
      "jsr",
      "bun",
      "workers",
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
    description: "Request-scoped dependency injection context for GraphQL and DataLoader patterns",
    keywords: [
      ...COMMON_KEYWORDS,
      "graphql",
      "context",
      "dataloader",
      "resolvers",
    ],
    homepage: homepage("graphql"),
    bugs: BUGS,
    npm: true,
  },
  next: {
    id: "next",
    npmName: "@wyrly/next",
    description: "Request-scoped dependency injection for Next.js App Router and Server Components",
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
    description: "Request-scoped dependency injection adapter for Fresh 2.x and Deno",
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
