# InversifyJS からの移行

このガイドは、`reflect-metadata`、parameter decorators、container magic
に依存しない、より小さく明示的な TypeScript DI layer が欲しい場合に、InversifyJS から Wyrly DI
への評価・移行を進めるためのものです。

English: [MIGRATING_FROM_INVERSIFY.md](./MIGRATING_FROM_INVERSIFY.md)

## モデルの主な違い

InversifyJS は強力で成熟していますが、多くのプロジェクトでは decorator metadata と runtime
reflection を使います。Wyrly DI では配線を明示します。

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}
```

Wyrly DI は、暗黙的な metadata-based discovery よりも、composition root、typed token、解析可能な
dependency graph を重視します。

## 概念の対応

| InversifyJS の概念                     | Wyrly DI での対応                                         |
| -------------------------------------- | --------------------------------------------------------- |
| `Container`                            | `createContainer()`                                       |
| `TYPES.UserRepository` symbols         | `token<UserRepository>("UserRepository")`                 |
| `@injectable()`                        | `@Injectable({ deps, lifetime })`                         |
| `@inject(TYPES.X)` parameter decorator | 明示的な `deps: [XToken]`                                 |
| `bind().to()`                          | `container.register(token, { useClass })`                 |
| `bind().toConstantValue()`             | `container.register(token, { useValue })`                 |
| `bind().toDynamicValue()`              | `container.register(token, { useFactory })`               |
| Request scope                          | `lifetime: "scoped"` + `createScope()` または Web adapter |

## 移行ステップ

1. bounded context または route group を 1 つ選ぶ。
2. 各 interface / port に対して Wyrly の typed token を定義する。
3. `@inject(...)` parameter decorators を `@Injectable({ deps })` または registration-time `deps`
   に移す。
4. binding を composition root の明示的な `container.register(...)` 呼び出しに置き換える。
5. framework adapter を使い、リクエストごとに 1 つの scope を作成・破棄する。
6. コードレビューや CI で graph visibility が役立つ場所に、`container.inspect()` または
   `container.validate()` を追加する。

## Before and after

Before:

```ts
const TYPES = {
  UserRepository: Symbol.for("UserRepository"),
};

@injectable()
class GetUserUseCase {
  constructor(@inject(TYPES.UserRepository) private readonly users: UserRepository) {}
}

container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container.bind(GetUserUseCase).toSelf();
```

After:

```ts
const UserRepositoryToken = token<UserRepository>("UserRepository");

@Injectable({ deps: [UserRepositoryToken], lifetime: "scoped" })
class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}
}

container.register(UserRepositoryToken, {
  useClass: PrismaUserRepository,
  lifetime: "scoped",
});
container.register(GetUserUseCase);
```

## 運用上変わること

- 依存関係がレビュー担当者や静的解析ツールから見える場所に列挙される。
- 標準デコレーターで十分になり、legacy metadata は不要になる。
- request scope が明示的になり、HTTP / GraphQL request lifetime と揃えられる。
- Wyrly core API から graph を export / validate できる。

## 最初に移行しやすい対象

明確な use case と repository boundary を持つ request path を 1 つ移行します。container
全体を書き換える前に、typed token、lifetime、adapter scope disposal を検証できます。
