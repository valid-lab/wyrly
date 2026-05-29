import { inversifyAdapter } from "./inversify.ts";
import { nestjsAdapter } from "./nestjs.ts";
import { tsyringeAdapter } from "./tsyringe.ts";
import type { AdapterName, BenchAdapter } from "./types.ts";
import { typedInjectAdapter } from "./typed-inject.ts";
import { vanillaAdapter } from "./vanilla.ts";
import { wyrlyAdapter } from "./wyrly.ts";

const adapters: Record<AdapterName, BenchAdapter> = {
  vanilla: vanillaAdapter,
  wyrly: wyrlyAdapter,
  "typed-inject": typedInjectAdapter,
  tsyringe: tsyringeAdapter,
  inversify: inversifyAdapter,
  nestjs: nestjsAdapter,
};

export function getAdapter(name: AdapterName): BenchAdapter {
  return adapters[name];
}

export function getAllAdapters(): BenchAdapter[] {
  return Object.values(adapters);
}

export function getAdapters(filter?: AdapterName[]): BenchAdapter[] {
  if (!filter || filter.length === 0) return getAllAdapters();
  return filter.map((name) => getAdapter(name));
}
