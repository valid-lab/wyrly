/** Typed DI token (at runtime only `id` and `name` carry meaning). */
export interface Token<T> {
  /** Discriminator for token objects. */
  readonly kind: "token";
  /** Unique symbol id for this token. */
  readonly id: symbol;
  /** Human-readable name (used in errors and graphs). */
  readonly name: string;
  /** Phantom type parameter for compile-time typing only. */
  readonly __type?: T;
}

/** Class constructor used as an injection token. */
export type ClassToken<T> = abstract new (...args: never[]) => T;

/** Either a {@link Token} or a class constructor token. */
export type InjectionToken<T> = Token<T> | ClassToken<T>;

/** Creates a typed injection token for interface-based dependencies. */
export function token<T>(name: string): Token<T> {
  return {
    kind: "token",
    id: Symbol(name),
    name,
  } as Token<T>;
}
