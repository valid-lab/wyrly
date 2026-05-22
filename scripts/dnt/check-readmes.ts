import * as path from "@std/path";
import { ALL_PACKAGE_IDS } from "./package-metadata.ts";

const OSS_ROOT = path.dirname(path.dirname(path.dirname(path.fromFileUrl(import.meta.url))));

let failed = false;

for (const id of ALL_PACKAGE_IDS) {
  for (const file of ["README.md", "README.ja.md"]) {
    const p = path.join(OSS_ROOT, "packages", id, file);
    try {
      await Deno.stat(p);
    } catch {
      console.error(`Missing: packages/${id}/${file}`);
      failed = true;
    }
  }
}

if (failed) Deno.exit(1);
console.log(`OK: ${ALL_PACKAGE_IDS.length} packages have README.md and README.ja.md`);
