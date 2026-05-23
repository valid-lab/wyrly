# basic-ddd

DDD 風の composition root と request scope（`createScope` / `dispose`）の最小例です。

English: [README.md](./README.md)

## 学ぶこと

- 型付き `token` と port インターフェース
- 標準 `@Injectable` と明示的 `deps`
- `scoped` lifetime と `dispose`

## この example で確認できること

- `reflect-metadata` や parameter decorators なしで DDD 風の UseCase を配線できる。
- interface ベースの port を `token<T>()` で型安全に扱える。
- request 風の scope が scoped service を所有し、明示的に破棄できる。

## 実行

```sh
deno task example:basic-ddd
```

## 次のステップ

| トピック                | Example                                    |
| ----------------------- | ------------------------------------------ |
| provider バリエーション | [provider-patterns](../provider-patterns/) |
| 依存グラフ・検証        | [dependency-graph](../dependency-graph/)   |
| HTTP アダプター         | [hono-api](../hono-api/)                   |
