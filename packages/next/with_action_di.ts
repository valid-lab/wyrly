import type { Container, Scope } from "@wyrly/core";

/**
 * Creates a DI scope per Server Action and passes `di` as the first argument.
 * Disposes the scope after completion (including on error, via `finally`).
 *
 * Request is not a standard argument, so no token is set.
 * Use `headers()` etc. inside the action if needed; equivalent to `configureScope` via
 * container registration or `scope.set` at the start of the action.
 */
export function withActionDI<T>(
  container: Container,
  action: (di: Scope, formData: FormData) => T | Promise<T>,
): (formData: FormData) => Promise<T> {
  return async (formData) => {
    const scope = container.createScope();
    try {
      return await action(scope, formData);
    } finally {
      await scope.dispose();
    }
  };
}
