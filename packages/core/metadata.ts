import type { ClassToken } from "./token.ts";
import type { Lifetime } from "./lifetime.ts";
import type { InjectionToken } from "./token.ts";

/** Options for the {@link Injectable} class decorator. */
export interface InjectableMetadata {
  /** Constructor dependency tokens. */
  deps?: InjectionToken<unknown>[];
  /** Default lifetime when registered via class token only. */
  lifetime?: Lifetime;
}

const injectableMetadata = new WeakMap<
  abstract new (...args: never[]) => unknown,
  InjectableMetadata
>();

export function setInjectableMetadata(
  ctor: ClassToken<unknown>,
  meta: InjectableMetadata,
): void {
  injectableMetadata.set(ctor, meta);
}

export function getInjectableMetadata(
  ctor: ClassToken<unknown>,
): InjectableMetadata | undefined {
  return injectableMetadata.get(ctor);
}
