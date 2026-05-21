/** Typed DI token (at runtime only `id` and `name` carry meaning) */
export interface Token<T> {
  readonly kind: "token";
  readonly id: symbol;
  readonly name: string;
  readonly __type?: T;
}

/** Class constructor used as an injection token */
export type ClassToken<T> = abstract new (...args: never[]) => T;

export type InjectionToken<T> = Token<T> | ClassToken<T>;

export function token<T>(name: string): Token<T> {
  return {
    kind: "token",
    id: Symbol(name),
    name,
  } as Token<T>;
}
