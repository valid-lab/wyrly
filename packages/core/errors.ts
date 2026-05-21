import type { InjectionToken } from "./token.ts";
import { tokenLabel } from "./internal_keys.ts";
import {
  errorMessage,
  type ErrorMessageKind,
  lifetimeViolationHint,
  type Locale,
  providerNotFoundHint,
  resolveLocale,
} from "./i18n.ts";

/** Dependency chain while resolving (for debugging and error display). */
export type ResolutionPath = readonly string[];

export interface ErrorLocaleOptions {
  locale?: Locale;
}

export class ProviderNotFoundError extends Error {
  readonly token: InjectionToken<unknown>;
  readonly path: ResolutionPath;

  constructor(
    token: InjectionToken<unknown>,
    path: ResolutionPath,
    options?: ErrorLocaleOptions,
  ) {
    const locale = resolveLocale(options);
    const label = tokenLabel(token);
    super(
      errorMessage("ProviderNotFound", {
        label,
        path: path.join(" -> "),
        hint: providerNotFoundHint(locale),
      }, locale),
    );
    this.name = "ProviderNotFoundError";
    this.token = token;
    this.path = path;
  }
}

export class CircularDependencyError extends Error {
  readonly path: ResolutionPath;

  constructor(path: ResolutionPath, options?: ErrorLocaleOptions) {
    const locale = resolveLocale(options);
    super(
      errorMessage("CircularDependency", {
        path: path.join(" -> "),
      }, locale),
    );
    this.name = "CircularDependencyError";
    this.path = path;
  }
}

export class InvalidProviderError extends Error {
  constructor(
    messageOrKind:
      | string
      | Extract<
        ErrorMessageKind,
        | "InvalidProvider_class_token_only"
        | "InvalidProvider_scoped_from_root"
        | "InvalidProvider_unsupported_provider_type"
      >,
    params?: Record<string, string> & ErrorLocaleOptions,
  ) {
    const locale = resolveLocale(params);
    const text = typeof messageOrKind === "string"
      ? errorMessage("InvalidProvider_custom", { detail: messageOrKind }, locale)
      : errorMessage(messageOrKind, params ?? {}, locale);
    super(text);
    this.name = "InvalidProviderError";
  }
}

export class ScopeDisposedError extends Error {
  constructor(options?: ErrorLocaleOptions) {
    const locale = resolveLocale(options);
    super(errorMessage("ScopeDisposed", {}, locale));
    this.name = "ScopeDisposedError";
  }
}

export class LifetimeViolationError extends Error {
  readonly fromLifetime: string;
  readonly toLifetime: string;
  readonly path: ResolutionPath;

  constructor(
    fromLifetime: string,
    toLifetime: string,
    path: ResolutionPath,
    options?: ErrorLocaleOptions,
  ) {
    const locale = resolveLocale(options);
    super(
      errorMessage("LifetimeViolation", {
        fromLifetime,
        toLifetime,
        path: path.join(" -> "),
        hint: lifetimeViolationHint(locale),
      }, locale),
    );
    this.name = "LifetimeViolationError";
    this.fromLifetime = fromLifetime;
    this.toLifetime = toLifetime;
    this.path = path;
  }
}

export class DuplicateProviderError extends Error {
  readonly token: InjectionToken<unknown>;

  constructor(token: InjectionToken<unknown>, options?: ErrorLocaleOptions) {
    const locale = resolveLocale(options);
    const label = tokenLabel(token);
    super(errorMessage("DuplicateProvider", { label }, locale));
    this.name = "DuplicateProviderError";
    this.token = token;
  }
}
