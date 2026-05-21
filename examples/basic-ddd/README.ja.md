# basic-ddd

DDD 風の composition root と request scope（`createScope` / `dispose`）の最小例です。

## 学ぶこと

- 型付き `token` と port インターフェース
- 標準 `@Injectable` と明示的 `deps`
- `scoped` lifetime と `dispose`

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
