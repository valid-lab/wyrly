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

/** Optional locale for localized error messages. */
export interface ErrorLocaleOptions {
  /** BCP 47 or POSIX tag; normalized to `en` or `ja`. */
  locale?: Locale;
}

/** Thrown when no provider is registered for a token. */
export class ProviderNotFoundError extends Error {
  /** Token that could not be resolved. */
  readonly token: InjectionToken<unknown>;
  /** Resolution path at failure time. */
  readonly path: ResolutionPath;

  /**
   * Creates a provider-not-found error.
   * @param token Missing token.
   * @param path Resolution path.
   * @param options Optional locale.
   */
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

/** Thrown when the dependency graph contains a cycle. */
export class CircularDependencyError extends Error {
  /** Cycle path including the repeating node. */
  readonly path: ResolutionPath;

  /**
   * Creates a circular-dependency error.
   * @param path Cycle path.
   * @param options Optional locale.
   */
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

/** Thrown for invalid provider registration or resolve rules. */
export class InvalidProviderError extends Error {
  /**
   * Creates an invalid-provider error.
   * @param messageOrKind Error kind or custom detail.
   * @param params Template params and optional locale.
   */
  constructor(
    messageOrKind:
      | string
      | Extract<
        ErrorMessageKind,
        | "InvalidProvider_class_token_only"
        | "InvalidProvider_scoped_from_root"
        | "InvalidProvider_unsupported_provider_type"
        | "InvalidProvider_child_scope_not_allowed"
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

/** Thrown when resolving or registering on a disposed scope. */
export class ScopeDisposedError extends Error {
  /**
   * Creates a scope-disposed error.
   * @param options Optional locale.
   */
  constructor(options?: ErrorLocaleOptions) {
    const locale = resolveLocale(options);
    super(errorMessage("ScopeDisposed", {}, locale));
    this.name = "ScopeDisposedError";
  }
}

/** Thrown when a shorter-lived provider depends on a longer-lived one at resolve time. */
export class LifetimeViolationError extends Error {
  /** Lifetime of the dependent registration. */
  readonly fromLifetime: string;
  /** Lifetime of the dependency registration. */
  readonly toLifetime: string;
  /** Resolution path at violation time. */
  readonly path: ResolutionPath;

  /**
   * Creates a lifetime-violation error.
   * @param fromLifetime Dependent lifetime.
   * @param toLifetime Dependency lifetime.
   * @param path Resolution path.
   * @param options Optional locale.
   */
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

/** Thrown when disposing a scope that still has undisposed child scopes. */
export class ScopeHasActiveChildrenError extends Error {
  /**
   * Creates a scope-has-active-children error.
   * @param options Optional locale.
   */
  constructor(options?: ErrorLocaleOptions) {
    const locale = resolveLocale(options);
    super(errorMessage("ScopeHasActiveChildren", {}, locale));
    this.name = "ScopeHasActiveChildrenError";
  }
}

/** Thrown when registering the same token twice in one registry. */
export class DuplicateProviderError extends Error {
  /** Token that was registered again. */
  readonly token: InjectionToken<unknown>;

  /**
   * Creates a duplicate-provider error.
   * @param token Duplicate token.
   * @param options Optional locale.
   */
  constructor(token: InjectionToken<unknown>, options?: ErrorLocaleOptions) {
    const locale = resolveLocale(options);
    const label = tokenLabel(token);
    super(errorMessage("DuplicateProvider", { label }, locale));
    this.name = "DuplicateProviderError";
    this.token = token;
  }
}
