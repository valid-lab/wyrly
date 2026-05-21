export type Locale = "en" | "ja";

export const DEFAULT_LOCALE: Locale = "en";

export type ValidationMessageCode =
  | "unresolved_dependency"
  | "singleton_depends_on_scoped"
  | "transient_depends_on_scoped"
  | "circular_dependency"
  | "unused_provider";

export type ErrorMessageKind =
  | "ProviderNotFound"
  | "CircularDependency"
  | "ScopeDisposed"
  | "LifetimeViolation"
  | "DuplicateProvider"
  | "InvalidProvider_class_token_only"
  | "InvalidProvider_scoped_from_root"
  | "InvalidProvider_unsupported_provider_type"
  | "InvalidProvider_custom";

/** Normalize BCP 47 / POSIX locale tags to supported `en` | `ja`. */
export function normalizeLocaleTag(tag: string): Locale {
  const primary = tag.trim().split(/[-_]/)[0]?.toLowerCase();
  if (primary === "ja") return "ja";
  return "en";
}

function envGet(key: string): string | undefined {
  try {
    return Deno.env.get(key);
  } catch {
    return undefined;
  }
}

/** Resolve locale from options, env, Intl, or fall back to `en`. */
export function resolveLocale(options?: { locale?: Locale }): Locale {
  if (options?.locale) return options.locale;

  const explicit = envGet("WYRLY_LOCALE");
  if (explicit) return normalizeLocaleTag(explicit);

  for (const key of ["LC_ALL", "LC_MESSAGES", "LANG"]) {
    const v = envGet(key);
    if (v) {
      const part = v.split(".")[0] ?? v;
      return normalizeLocaleTag(part.replace("_", "-"));
    }
  }

  try {
    const intl = Intl.DateTimeFormat().resolvedOptions().locale;
    if (intl) return normalizeLocaleTag(intl);
  } catch {
    // ignore
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return normalizeLocaleTag(navigator.language);
  }

  return DEFAULT_LOCALE;
}

export function validationMessage(
  code: ValidationMessageCode,
  params: Record<string, string>,
  locale: Locale,
): string {
  const { fromId, depId, cycle } = params;
  switch (code) {
    case "unresolved_dependency":
      return locale === "ja"
        ? `${fromId} が未登録の依存 ${depId} を参照しています。`
        : `${fromId} references unregistered dependency ${depId}.`;
    case "singleton_depends_on_scoped":
      return locale === "ja"
        ? `${fromId} (singleton) が scoped の依存 ${depId} に依存しています。`
        : `${fromId} (singleton) depends on scoped dependency ${depId}.`;
    case "transient_depends_on_scoped":
      return locale === "ja"
        ? `${fromId} (transient) が scoped の依存 ${depId} に依存しています。実行コンテキストに注意してください。`
        : `${fromId} (transient) depends on scoped dependency ${depId}. Mind the execution context.`;
    case "circular_dependency":
      return locale === "ja" ? `循環依存: ${cycle ?? ""}` : `Circular dependency: ${cycle ?? ""}`;
    case "unused_provider":
      return locale === "ja"
        ? `${fromId} は他の provider から依存されていません（未使用の可能性があります）。`
        : `${fromId} is not depended on by any other provider (may be unused).`;
  }
}

export function errorMessage(
  kind: ErrorMessageKind,
  params: Record<string, string>,
  locale: Locale,
): string {
  const label = params.label ?? "";
  const path = params.path ?? "";
  const hint = params.hint ?? "";
  const detail = params.detail ?? "";
  const fromLifetime = params.fromLifetime ?? "";
  const toLifetime = params.toLifetime ?? "";
  const providerType = params.providerType ?? "";

  switch (kind) {
    case "ProviderNotFound":
      return locale === "ja"
        ? `ProviderNotFoundError: ${label} を解決できません。依存パス: [${path}]。${hint}`
        : `ProviderNotFoundError: Cannot resolve ${label}. Dependency path: [${path}]. ${hint}`;
    case "CircularDependency":
      return locale === "ja"
        ? `CircularDependencyError: 循環依存を検出しました: ${path}。依存関係を見直してください。`
        : `CircularDependencyError: Circular dependency detected: ${path}. Review your dependency graph.`;
    case "ScopeDisposed":
      return locale === "ja"
        ? "ScopeDisposedError: すでに dispose 済みのスコープで resolve しようとしました。リクエスト終了後に resolve していないか確認してください。"
        : "ScopeDisposedError: Attempted to resolve on an already disposed scope. Check for resolve after request end.";
    case "LifetimeViolation":
      return locale === "ja"
        ? `LifetimeViolationError: lifetime ${fromLifetime} が ${toLifetime} に依存しようとしています。パス: [${path}]。${hint}`
        : `LifetimeViolationError: lifetime ${fromLifetime} cannot depend on ${toLifetime}. Path: [${path}]. ${hint}`;
    case "DuplicateProvider":
      return locale === "ja"
        ? `DuplicateProviderError: ${label} はすでに登録されています。上書きする場合は override() を使ってください。`
        : `DuplicateProviderError: ${label} is already registered. Use override() to replace it.`;
    case "InvalidProvider_class_token_only":
      return locale === "ja"
        ? "InvalidProviderError: provider を省略できるのはクラストークンのみです。"
        : "InvalidProviderError: Omitting provider is only allowed for class tokens.";
    case "InvalidProvider_scoped_from_root":
      return locale === "ja"
        ? "InvalidProviderError: scoped のプロバイダは createScope() で得た Scope から resolve() してください。"
        : "InvalidProviderError: Resolve scoped providers from a Scope created via createScope().";
    case "InvalidProvider_unsupported_provider_type":
      return locale === "ja"
        ? `InvalidProviderError: 未対応の providerType: ${providerType}`
        : `InvalidProviderError: Unsupported providerType: ${providerType}`;
    case "InvalidProvider_custom":
      return `InvalidProviderError: ${detail}`;
  }
}

export function providerNotFoundHint(locale: Locale): string {
  return locale === "ja"
    ? "composition root で register() するか、@Injectable() の deps を確認してください。"
    : "Register it in the composition root or check @Injectable() deps.";
}

export function lifetimeViolationHint(locale: Locale): string {
  return locale === "ja"
    ? "singleton は scoped インスタンスに依存できません。scoped にするか、依存を singleton/transient に変更してください。"
    : "singleton cannot depend on scoped instances. Use scoped lifetime or change dependencies to singleton/transient.";
}
