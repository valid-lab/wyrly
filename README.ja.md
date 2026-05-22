# Wyrly DI

> モダン TypeScript 向けの明示的 DI。

English: [README.md](README.md) · [API（日本語）](API.ja.md) · [変更履歴（日本語）](CHANGELOG.ja.md) ·
[公開手順（日本語）](PUBLISHING.ja.md) · [Examples（日本語）](examples/README.ja.md)

Wyrly DI は、明示的で解析しやすく型安全なアプリケーション構成のための依存性注入（DI）ツールキットです。

DDD、クリーンアーキテクチャ、リクエストスコープ、型付き token、標準デコレーター、各種フレームワーク adapter を想定した、モダン TypeScript アプリケーション向けに設計されています。

## コンセプト

```txt
Wyrly DI
for explicit, analyzable, type-safe application architecture.
```

## なぜ Wyrly DI か

多くの TypeScript 向け DI ライブラリは、legacy decorators、`reflect-metadata`、`emitDecoratorMetadata` を前提にしています。

Wyrly DI は別のアプローチを取ります。

```txt
reflect-metadata 不要
legacy decorators 不要
parameter decorators 不要
実行時の型推測なし
依存関係は明示
型安全な token
リクエストスコープ
ライフタイム検証
解析可能な依存グラフ
```

## 目標

- TypeScript 標準デコレーターで動作する
- `reflect-metadata` を使わない
- `emitDecoratorMetadata` を使わない
- parameter decorators を使わない
- 型付き token を提供する
- 明示的な `deps` によるコンストラクタ注入をサポートする
- singleton / scoped / transient ライフタイムをサポートする
- Web アプリ向けリクエストスコープをサポートする
- Next.js、Express、Hono、Fresh、GraphQL 用 adapter を提供する
- DDD / クリーンアーキテクチャをサポートする
- CLI / CI / AI ツール向けに解析可能な依存グラフを提供する

## 非目標

Wyrly DI は NestJS のクローンにはなりません。

意図的に避けているもの:

- コンストラクタの型メタデータの自動取得
- 実行時の型推測
- グローバルコンテナの魔法
- glob による自動スキャン / 自動登録
- core パッケージのフレームワーク密結合
- クライアントサイド React DI を主用途とすること

## パッケージ

```txt
@wyrly/core
@wyrly/next
@wyrly/express
@wyrly/hono
@wyrly/fresh
@wyrly/graphql
```

Wyrly Pro CLI（`wyrly doctor`、`wyrly graph`、`wyrly validate`、`wyrly generate`）は別製品（非公開リポジトリ・商用）であり、本 OSS リポジトリには含まれません。

凍結された **v1.0** の公開 API 一覧は [API.ja.md](./API.ja.md) を参照してください。

## インストール

**v1.0.0** — **JSR** または **npm** から利用するか、本リポジトリを workspace として開発します。公開の詳細は [PUBLISHING.ja.md](./PUBLISHING.ja.md) を参照してください。

### JSR（Deno）

```jsonc
// deno.json
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^1.0.0"
  }
}
```

```ts
import { createContainer, token } from "@wyrly/core";
```

adapter は必要に応じて追加します（例: `jsr:@wyrly/next@^1.0.0`）。

### npm（Node / バンドラー）

```sh
npm install @wyrly/core
```

```ts
import { createContainer, token } from "@wyrly/core";
```

adapter は必要に応じて追加します（例: `npm install @wyrly/next`）。**`@wyrly/fresh` は JSR のみ**（Fresh 2.x に npm パッケージはありません）。公開手順（[dnt](https://github.com/denoland/dnt) によるビルド）は [PUBLISHING.ja.md](./PUBLISHING.ja.md) を参照してください。

### Bun / Cloudflare Workers

npm 公開の全パッケージ（`@wyrly/fresh` を除く）は **Node.js**（`compat/node`）と **Bun**（`compat/bun`）でスモークテスト。**Cloudflare Workers** は `@wyrly/core` と `@wyrly/hono`（`compat/workers`）。メンテナ向け: `deno task test:compat` — [PUBLISHING.ja.md](./PUBLISHING.ja.md) 参照。

### 本リポジトリでの開発（workspace）

```sh
git clone <your-fork-or-upstream-url>
cd wyrly/oss
deno task setup:hooks   # 任意: Lefthook — pre-commit (fmt+lint), pre-push (fmt:check)
deno task check
deno task test
```

workspace の bare specifier で import します:

```ts
import { createContainer, token } from "@wyrly/core";
```

## クイックスタート

```ts
import { createContainer, Injectable, token } from "@wyrly/core";

interface UserRepository {
  findById(id: string): Promise<User | null>;
}

const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(id: string) {
    return this.users.findById(id);
  }
}

class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // ...
    return null;
  }
}

const container = createContainer();

container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
  lifetime: "scoped",
});

container.register(GetUserUseCase);

const scope = container.createScope();

try {
  const usecase = scope.resolve(GetUserUseCase);
  const user = await usecase.execute("user-1");
} finally {
  await scope.dispose();
}
```

## 型付き Token

TypeScript では interface は実行時に消えます。\
interface ベースの依存を安全に注入するには、型付き token を使います。

```ts
export const UserRepositoryToken = token<UserRepository>("UserRepository");

const users = scope.resolve(UserRepositoryToken);
// users: UserRepository
```

## 標準デコレーター

`@Injectable()` で依存メタデータを付与します。

```ts
@Injectable({
  deps: [UserRepositoryToken],
  lifetime: "scoped",
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

デコレーターは必須ではありません。

```ts
container.register(GetUserUseCase, {
  useClass: GetUserUseCase,
  deps: [UserRepositoryToken],
  lifetime: "scoped",
});
```

## Parameter Decorators は非対応

Wyrly DI は parameter decorators をサポートしません。

非対応の例:

```ts
class GetUserUseCase {
  constructor(
    @Inject(UserRepositoryToken) private readonly users: UserRepository,
  ) {}
}
```

代わりに明示的な `deps` を使います:

```ts
@Injectable({
  deps: [UserRepositoryToken],
})
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

## Provider

### useClass

```ts
container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
});
```

### useValue

```ts
container.register(ConfigToken, {
  useValue: config,
});
```

### useFactory

```ts
container.register(DatabaseToken, {
  useFactory: (scope) => createDatabase(scope.resolve(ConfigToken)),
});
```

## ライフタイム

サポートするライフタイム:

```ts
type Lifetime = "singleton" | "scoped" | "transient";
```

### singleton

ルートコンテナあたり 1 インスタンス。

```ts
container.register(LoggerToken, {
  useClass: ConsoleLogger,
  lifetime: "singleton",
});
```

### scoped

スコープあたり 1 インスタンス。

```ts
container.register(UnitOfWorkToken, {
  useClass: PrismaUnitOfWork,
  lifetime: "scoped",
});
```

### transient

resolve のたびに新しいインスタンス。

```ts
container.register(TaskToken, {
  useClass: Task,
  lifetime: "transient",
});
```

## リクエストスコープ

Web 向け adapter はリクエストごとに 1 つのスコープを作ります。

```txt
1 HTTP リクエスト = 1 DI スコープ
1 GraphQL リクエスト = 1 DI スコープ
```

## Express の例

```ts
import express from "express";
import { asExpressRequestWithDI, diMiddleware } from "@wyrly/express";
import { appContainer } from "./di/container";

const app = express();

app.use(diMiddleware(appContainer));

app.get("/users/:id", async (req, res) => {
  const usecase = asExpressRequestWithDI(req).di.resolve(GetUserUseCase);
  const user = await usecase.execute(req.params.id);

  res.json(user);
});
```

JSR 公開パッケージでは `declare global` が使えません。アプリ側で `Express.Request` を拡張する `.d.ts` を置くこともできます。

## Hono の例

```ts
import { Hono } from "hono";
import { di, getDI, type HonoDIVariables } from "@wyrly/hono";
import { appContainer } from "./di/container";

const app = new Hono<{ Variables: HonoDIVariables }>();

app.use(di(appContainer));

app.get("/users/:id", async (c) => {
  const usecase = getDI(c).resolve(GetUserUseCase);

  return c.json(await usecase.execute(c.req.param("id")));
});
```

## Fresh の例

```ts
import { App } from "fresh";
import { di, type FreshDIState, withDI } from "@wyrly/fresh";
import { appContainer } from "./di/container";

const app = new App<FreshDIState>();

app.use(di(appContainer));

app.get("/users/:id", async (ctx) => {
  const usecase = ctx.state.di.resolve(GetUserUseCase);

  return Response.json(await usecase.execute(ctx.params.id));
});

export const GET = withDI(appContainer, async (ctx) => {
  const usecase = ctx.di.resolve(GetUserUseCase);
  const user = await usecase.execute(ctx.params.id);

  return Response.json(user);
});
```

## GraphQL の例

```ts
import { createGraphQLDIContext } from "@wyrly/graphql";

const context = async ({ req, res }) =>
  createGraphQLDIContext(appContainer, {
    request: req,
    response: res,
  });

const resolvers = {
  Query: {
    user: async (_parent, args, ctx) => {
      const usecase = ctx.di.resolve(GetUserUseCase);
      return await usecase.execute(args.id);
    },
  },
};
```

## Next.js Route Handler の例

```ts
import { withDI } from "@wyrly/next";
import { appContainer } from "@/di/container";

export const GET = withDI(appContainer, async (req, { di, params }) => {
  const usecase = di.resolve(GetUserUseCase);
  const user = await usecase.execute(params.id);

  return Response.json(user);
});
```

**Server Components**（`createServerDI`、`getDI()`、`cache()` と `after()` によるリクエストスコープ）については [guides/SERVER_COMPONENTS.ja.md](./guides/SERVER_COMPONENTS.ja.md) を参照してください。

## DDD 向けの構成

推奨ディレクトリ構成:

```txt
src/
  domain/
    models/
    repositories/
  application/
    usecases/
  infrastructure/
    repositories/
    database/
  presentation/
    http/
    graphql/
  composition/
    container.ts
```

composition root の例:

```ts
export function configureContainer(container: Container) {
  container.register(UserRepositoryToken, {
    useClass: PrismaUserRepository,
    lifetime: "scoped",
  });

  container.register(GetUserUseCase);
}
```

## ライフタイム検証

コンテナは危険なライフタイムの組み合わせを検出できます。

例:

```ts
@Injectable({
  lifetime: "singleton",
  deps: [CurrentUserToken],
})
class AuditLogger {}
```

`CurrentUserToken` が scoped の場合、これは失敗すべきです。

```txt
LifetimeViolationError:
Singleton AuditLogger cannot depend on scoped CurrentUser.
```

## 解析可能な依存グラフ

```ts
const graph = container.inspect();
```

グラフの例:

```ts
{
  nodes: [
    {
      id: "GetUserUseCase",
      name: "GetUserUseCase",
      lifetime: "scoped",
      provider: "class"
    }
  ],
  edges: [
    {
      from: "GetUserUseCase",
      to: "UserRepository"
    }
  ]
}
```

これにより次が可能になります:

- 依存グラフの可視化
- CI による検証
- アーキテクチャルールのチェック
- AI 支援によるコード理解
- デバッグ

## Pro CLI なしでの検証

composition root や CI から core API を直接使えます:

```ts
const { ok, issues } = container.validate({ locale: "ja" });
```

依存グラフの例（inspect + validate の出力）:

```sh
deno task validate:example
# または: deno task example:dependency-graph
```

グラフ出力ヘルパーは `@wyrly/core` にあります（`graphToJson`、`graphToDot`、`graphToMermaid`）。

**`wyrly` CLI**（doctor、CI 向け JSON レポート、HTML グラフ、スキャフォールド）は **Wyrly Pro**（非公開リポジトリ・商用ライセンス）です。

## TypeScript 設定

推奨設定:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "emitDecoratorMetadata": false
  }
}
```

## 設計原則

```txt
魔法より明示。
隠蔽より解析可能。
legacy decorators より標準デコレーター。
文字列 token より型付き token。
自動スキャンより composition root。
フレームワーク密結合より adapter。
```

## ランタイムの言語（i18n）

エラーや `validate()` の表示文は実行環境（`LANG`、`WYRLY_LOCALE` など）から自動判定されます。`container.validate({ locale: "ja" })` でも指定できます。

## API の安定性

**1.0.0** 以降、公開 API は [API.ja.md](./API.ja.md) に列挙し、[Semantic Versioning](https://semver.org/lang/ja/) に従います。リリース内容は [CHANGELOG.ja.md](./CHANGELOG.ja.md) を参照してください。

## ロードマップ

### v0.1–v0.5

**1.0.0** で提供済み: core、adapter、inspect/validate、examples、本リポジトリの CI。

### v1.0（リリース済み）

- 安定した公開 API（[API.ja.md](./API.ja.md)）
- 本番向けドキュメントと [CHANGELOG.ja.md](./CHANGELOG.ja.md)
- `examples/` 配下の実行可能なテンプレート風サンプル

## マネタイズ

core と adapter は無料 OSS として提供します。

有償製品の例:

- Pro CLI
- 依存グラフのビジュアル表示
- CI 向けアーキテクチャ検証
- スターターテンプレート
- エンタープライズサポート
- アーキテクチャレビュー
- 移行サポート

## ライセンス

本リポジトリの core、adapter、examples は [Apache License 2.0](LICENSE) です。

Wyrly Pro（CLI、テンプレート）は別ライセンスであり、ソースは本リポジトリに含まれません。

## Deno での開発

本リポジトリは **Deno workspace** です（[`deno.jsonc`](./deno.jsonc) を参照）。ライブラリは `packages/*` にあり、`@wyrly/core` などの bare specifier で import します。

要件:

- **Deno 2.x**（Deno 2.7+ で検証）

よく使うコマンド:

```sh
deno task check      # packages/ と examples/ の型チェック
deno task fmt        # packages/ + examples/ + deno.jsonc のフォーマット
deno task fmt:check
deno task lint
deno task test
deno task examples   # 全 core 系 example（examples/README.ja.md 参照）
```

フレームワーク非依存の example:

```sh
deno task example:basic-ddd
deno task example:explicit-deps
deno task example:provider-patterns
deno task example:dependency-graph
```

JSR や `npm:` 依存を追加したら、再現性のため生成された **`deno.lock`** をコミットしてください。npm パッケージを多く使う場合は [Deno ドキュメント](https://docs.deno.com/) に従い `deno.jsonc` で `nodeModulesDir` を検討してください。

## ステータス

**v1.0.0** — `@wyrly/core` と各 adapter は [API.ja.md](./API.ja.md) に記載の公開面を安定版として扱います。Issue は各プロジェクトのトラッカーへ。

コントリビュータ向け: [AGENT.md](./AGENT.md)（英語）。利用者向け日本語: [README.ja.md](README.ja.md)、[API.ja.md](API.ja.md)、[CHANGELOG.ja.md](CHANGELOG.ja.md)。
