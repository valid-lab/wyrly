import { buildNpmPackage, NPM_PACKAGE_ORDER, PACKAGE_CONFIGS, type NpmPackageId } from "./_common.ts";

const arg = Deno.args[0];

if (arg === "all" || !arg) {
  for (const id of NPM_PACKAGE_ORDER) {
    await buildNpmPackage(PACKAGE_CONFIGS[id]);
  }
} else if (arg === "fresh") {
  console.error(
    "@wyrly/fresh is not published to npm (use JSR: jsr:@wyrly/fresh). Fresh 2.x is JSR-only.",
  );
  Deno.exit(1);
} else if (arg in PACKAGE_CONFIGS) {
  await buildNpmPackage(PACKAGE_CONFIGS[arg as NpmPackageId]);
} else {
  console.error(
    `Unknown package: ${arg}. Use: all | ${NPM_PACKAGE_ORDER.join(" | ")}`,
  );
  Deno.exit(1);
}
