import type { ClassDecoratorContext } from "./types_decorator.ts";
import type { ClassToken } from "./token.ts";
import type { InjectableMetadata } from "./metadata.ts";
import { setInjectableMetadata } from "./metadata.ts";

/**
 * Standard (TC39) class decorator. Metadata is stored in a WeakMap; reflect-metadata is not used.
 */
export function Injectable(
  options: InjectableMetadata = {},
): <T extends ClassToken<unknown>>(
  value: T,
  context: ClassDecoratorContext<T>,
) => void {
  return <T extends ClassToken<unknown>>(
    value: T,
    _context: ClassDecoratorContext<T>,
  ): void => {
    setInjectableMetadata(value, options);
  };
}
