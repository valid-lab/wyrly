# 公開 API（v1.0）

English: [API.md](./API.md)

Wyrly DI **v1.0.0** の **安定公開 export** 一覧です。ここに載っていないシンボルや deep import は semver 保証の対象外です。

## バージョニング方針

**1.0.0** 以降は [Semantic Versioning](https://semver.org/) に従います。

- **Major**: 下表の export の削除、またはドキュメントで保証するシグネチャ・挙動の破壊的変更
- **Minor**: 後方互換な export の追加
- **Patch**: API 変更のないバグ修正

正: 各パッケージの [`mod.ts`](./packages/core/mod.ts) の re-export。

---

## `@wyrly/core`

エントリ: [`packages/core/mod.ts`](./packages/core/mod.ts)

### 関数

| Export | 説明 |
|--------|------|
| `token` | 型付き injection token の作成 |
| `Injectable` | 標準デコレータ（明示的 `deps` / `lifetime`） |
| `createContainer` | ルート DI コンテナの作成 |
| `graphToJson` | `DependencyGraph` を JSON にシリアライズ |
| `graphToDot` | グラフを DOT 形式に |
| `graphToMermaid` | グラフを Mermaid 形式に |
| `validateNormalizedProviders` | provider レジストリの検証（上級者向け。通常は `container.validate()`） |
| `errorMessage` | ランタイムエラーのローカライズ文言 |
| `validationMessage` | 検証 issue のローカライズ文言 |
| `normalizeLocaleTag` | ロケールタグを `en` / `ja` に正規化 |
| `resolveLocale` | オプション・環境変数からロケール解決 |
| `providerNotFoundHint` | 未登録 provider 向けヒント |
| `lifetimeViolationHint` | lifetime 違反向けヒント |

### 型

| Export | 説明 |
|--------|------|
| `Token`, `ClassToken`, `InjectionToken` | token 関連の型 |
| `Lifetime` | `"singleton"` \| `"scoped"` \| `"transient"` |
| `Container` | ルートコンテナのインターフェース |
| `Scope` | リクエスト / 子スコープのインターフェース |
| `Provider`, `ClassProvider`, `ValueProvider`, `FactoryProvider`, `ExistingProvider` | provider の形 |
| `DependencyGraph`, `DependencyNode`, `DependencyEdge` | inspect API のグラフ型 |
| `GraphToJsonOptions` | `graphToJson` のオプション |
| `ValidateOptions`, `ValidationResult`, `ValidationIssue` | validate API の型 |
| `Locale`, `ValidationMessageCode`, `ErrorMessageKind` | i18n 関連の型 |
| `DEFAULT_LOCALE` | デフォルトロケール定数 |

### クラス（エラー）

| Export |
|--------|
| `ProviderNotFoundError` |
| `CircularDependencyError` |
| `InvalidProviderError` |
| `ScopeDisposedError` |
| `LifetimeViolationError` |
| `DuplicateProviderError` |

### `Container` のメソッド（`createContainer()` の戻り値）

| メソッド | 説明 |
|----------|------|
| `register` | provider の登録 |
| `resolve` | ルートから解決（singleton / transient） |
| `createScope` | 子スコープの作成 |
| `override` | 登録済み provider の上書き |
| `inspect` | 依存グラフの取得 |
| `validate` | レジストリの設計時チェック |

### `Scope` のメソッド

| メソッド | 説明 |
|----------|------|
| `resolve` | スコープ内で解決 |
| `register` | スコープローカルな provider |
| `set` | スコープローカルな値 |
| `dispose` | スコープ内インスタンスの破棄 |
| `isDisposed` | dispose 済みか |

---

## `@wyrly/express`

エントリ: [`packages/express/mod.ts`](./packages/express/mod.ts)

| Export | 説明 |
|--------|------|
| `diMiddleware` | Express ミドルウェア（リクエストごとに scope、`req.di`） |
| `ExpressRequestToken` | `Request` 用 token |
| `ExpressResponseToken` | `Response` 用 token |
| `ExpressRequestWithDI` | `Request & { di: Scope }` |
| `asExpressRequestWithDI` | `diMiddleware` 後の `req` を絞り込む（`as` よりこちらを推奨） |

JSR 公開パッケージでは `declare global` が使えないため、グローバル拡張は廃止しました。必要ならアプリ側で `Express.Request` を拡張する `.d.ts` を置いてください。

---

## `@wyrly/hono`

エントリ: [`packages/hono/mod.ts`](./packages/hono/mod.ts)

| Export | 説明 |
|--------|------|
| `di` | Hono ミドルウェア（`c.set("di", scope)`） |
| `HonoContextToken` | Hono コンテキスト用 token |
| `RequestToken` | 生の `Request` 用 token |

---

## `@wyrly/fresh`

エントリ: [`packages/fresh/mod.ts`](./packages/fresh/mod.ts)

| Export | 説明 |
|--------|------|
| `di` | Fresh ミドルウェア（`ctx.state.di`） |
| `withDI` | ルート単位の handler ラッパー |
| `FreshContextToken` | Fresh `Context` 用 token |
| `RequestToken` | `Request` 用 token |

### 型

| Export |
|--------|
| `FreshDIState` |
| `FreshDIOptions` |
| `FreshDIContext` |
| `FreshDIHandler` |

---

## `@wyrly/graphql`

エントリ: [`packages/graphql/mod.ts`](./packages/graphql/mod.ts)

| Export | 説明 |
|--------|------|
| `createGraphQLDIContext` | GraphQL コンテキストと `di` scope の構築 |
| `GraphQLRequestToken` | `Request` 用 token |
| `GraphQLResponseToken` | `Response` 用 token |

### 型

| Export |
|--------|
| `GraphQLDIContext` |
| `CreateGraphQLDIContextOptions` |

---

## `@wyrly/next`

エントリ: [`packages/next/mod.ts`](./packages/next/mod.ts)

| Export | 説明 |
|--------|------|
| `withDI` | Next.js Route Handler ラッパー |
| `withActionDI` | Server Action ラッパー |
| `createServerDI` | Server Components 向け（リクエストごとに `getDI()`）— [guides/SERVER_COMPONENTS.ja.md](./guides/SERVER_COMPONENTS.ja.md) |
| `NextRequestToken` | `NextRequest` 用 token |

### 型

| Export |
|--------|
| `RouteHandlerContext` |
| `WithDIOptions` |
| `CreateServerDIOptions` |
| `AfterScheduler` |
