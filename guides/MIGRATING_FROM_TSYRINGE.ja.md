# tsyringe からの移行

このガイドは、`reflect-metadata`、legacy decorator
metadata、暗黙的なコンストラクタ型検出を避けることを主目的として、`tsyringe` から Wyrly DI
への評価・移行を進めるためのものです。

English: [MIGRATING_FROM_TSYRINGE.md](./MIGRATING_FROM_TSYRINGE.md)

## モデルの主な違い

`tsyringe` は、emitted metadata からコンストラクタ依存を検出する使い方が一般的です。Wyrly DI
では依存を明示します。

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

この追加の `deps` list は意図的なものです。依存の配線が TypeScript、CI、コードレビュー、graph
を解析するツールから見える形で残ります。

## 概念の対応

| tsyringe の概念                      | Wyrly DI での対応                            |
| ------------------------------------ | -------------------------------------------- |
| `@injectable()`                      | `@Injectable({ deps, lifetime })`            |
| `@inject(token)` parameter decorator | 型付き `token<T>()` + 明示的な `deps`        |
| Container registration               | `container.register(tokenOrClass, provider)` |
| Child container / request container  | `container.createScope()` または Web adapter |
| Singleton / transient lifecycle      | `lifetime: "singleton"` / `"transient"`      |
| リクエストごとの scope               | `lifetime: "scoped"` + adapter が作る scope  |

## 移行ステップ

1. 依存を登録している composition root を 1 つ特定する。
2. interface / string token を Wyrly の typed token に置き換える。
3. constructor parameter decorators を `@Injectable({ deps })` または registration-time `deps`
   に移す。
4. リクエストに紐づく依存を `lifetime: "scoped"` で登録する。
5. Web の入口を対応する adapter で包む。
   - App Router なら `@wyrly/next`
   - Hono / Cloudflare Workers なら `@wyrly/hono`
   - Express なら `@wyrly/express`
   - GraphQL context なら `@wyrly/graphql`
6. 複数の lifetime が出てきたら、テストまたは CI で `container.validate()` を追加する。

## Before and after

Before:

```ts
@injectable()
class GetUserUseCase {
  constructor(@inject("UserRepository") private readonly users: UserRepository) {}
}
```

After:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

## 運用上変わること

- `reflect-metadata` が不要になる。
- `emitDecoratorMetadata` が不要になる。
- parameter decorators を使わない。
- container API から graph を inspect / validate できる。
- request scope が明示的かつ adapter の責務になるため、破棄タイミングを理解しやすい。

## 最初に移行しやすい対象

repository token、use case 1 つ、HTTP / GraphQL entry point 1 つを含む feature slice
から始めます。すべての service を一度に移行するのではなく、新しい composition root と request scope
model を先に検証することが目的です。
