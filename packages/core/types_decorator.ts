/**
 * Minimal surface compatible with Deno / TypeScript ClassDecoratorContext.
 * Defined locally so types work in environments without DOM in `lib`.
 */
export interface ClassDecoratorContext<
  T extends abstract new (...args: never[]) => unknown = abstract new (
    ...args: never[]
  ) => unknown,
> {
  readonly kind: "class";
  readonly name: string | undefined;
  readonly metadata: unknown;
  addInitializer(initializer: (this: T) => void): void;
}
