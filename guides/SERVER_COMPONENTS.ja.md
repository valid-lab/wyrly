# Next.js Server Components と DI

English: [SERVER_COMPONENTS.md](./SERVER_COMPONENTS.md)

App Router の **Server Components** で `@wyrly/next` の `createServerDI`
を使い、リクエストスコープをグローバルに持たない方法を説明します。

## 前提

- **Next.js 15+** App Router
- **React 19**（`react` の `cache()`）
- `next/server` の `after()`（レスポンス後に scope を `dispose`）

Route Handler / Server Action は別 API です（下表参照）。

## リクエストモデル

1 HTTP リクエスト = **1 つの DI scope**（scoped / transient の前提）。

- `cache()` … 同一リクエスト内の `getDI()` は同じ scope を返す
- `after()` … レスポンス完了後に `scope.dispose()` を実行

実装: [`packages/next/server_di.ts`](../packages/next/server_di.ts)

## セットアップ

### 1. Composition root

通常どおりルート `Container` に provider を登録します。

### 2. Server DI ファクトリ（アプリで 1 回）

```ts
import { appContainer } from "./container.ts";
import { createServerDI } from "@wyrly/next";

export const { getDI } = createServerDI(appContainer);
```

テストでは `after`
をモックします（[next-ddd の例](../examples/next-ddd/presentation/server_component.ts)）。

### 3. Server Component での利用

```tsx
import { getDI } from "@/composition/server_di";
import { GetUserUseCase } from "@/application/get_user";

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const di = getDI();
  const usecase = di.resolve(GetUserUseCase);
  const user = await usecase.execute(id);
  return <pre>{JSON.stringify(user)}</pre>;
}
```

`getDI()` は **リクエスト内**（Page / Layout
およびその同期呼び出し）でのみ呼び出してください。モジュールトップレベルやバックグラウンドジョブでは使わないでください。

### 4. リクエスト固有の値

```ts
const di = getDI();
di.set(CurrentUserToken, { id: userId });
```

ドメイン層に `NextRequestToken` を直接 inject せず、**port token** にマップします。

## API 比較（`@wyrly/next`）

| API                          | 用途              | scope の寿命                                      |
| ---------------------------- | ----------------- | ------------------------------------------------- |
| `withDI`                     | Route Handler     | ハンドラ 1 回ごと、`finally` で dispose           |
| `withActionDI`               | Server Action     | Action 1 回ごと、`finally` で dispose             |
| `createServerDI` → `getDI()` | Server Components | `cache()` でリクエスト 1 つ、`after()` で dispose |

## テスト

- `after` をモックして dispose を決定的に実行
- `createServerDI` を複数作ると scope は共有されない
- 1 リクエストのシミュレーションでは同じ `getDI` を使う

テストコード: [`packages/next/server_di_test.ts`](../packages/next/server_di_test.ts)

## アンチパターン

| 避けること                      | 理由                                      |
| ------------------------------- | ----------------------------------------- |
| `Scope` をグローバル変数に保存  | リクエスト間で混線                        |
| リクエスト外で `getDI()`        | `cache()` は React のリクエスト文脈に依存 |
| テスト間で factory を共有しすぎ | scope が漏れる                            |
| UseCase に `NextRequest` を注入 | ドメインが Next に依存                    |
| Edge で未検証のまま本番投入     | `after` / `cache` の可否はデプロイ先次第  |

## 安定性

`createServerDI` / `getDI()` の API 形状は v2.0 で安定です。内部で使う Next / React
の挙動はバージョンに依存するため、Next アップグレード時は adapter テストを再実行してください。

## 関連

- [examples/next-ddd](../examples/next-ddd/)
- [API.ja.md — `@wyrly/next`](../API.ja.md#wyrlynext)
- [README.ja.md](../README.ja.md)
