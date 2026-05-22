/**
 * Minimal surface compatible with Deno / TypeScript ClassDecoratorContext.
 * Defined locally so types work in environments without DOM in `lib`.
 */
export interface ClassDecoratorContext<
  T extends abstract new (...args: never[]) => unknown = abstract new (
    ...args: never[]
  ) => unknown,
> {
  /** Always `"class"` for class decorators. */
  readonly kind: "class";
  /** Decorated class name, if available. */
  readonly name: string | undefined;
  /** Decorator metadata bag (standard decorators). */
  readonly metadata: unknown;
  /** Registers a class instance initializer. */
  addInitializer(initializer: (this: T) => void): void;
}
