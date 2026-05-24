# dependency-graph

`container.inspect()` と `container.validate()`
で依存グラフを確認する例です。`export const container` が composition root です。

English: [README.md](./README.md)

## 学ぶこと

- 依存グラフのノード・エッジ
- Mermaid / DOT 形式への export（`graphToMermaid` / `graphToDot`）
- バリデーション issue（循環依存・lifetime 違反・未使用 provider 等）

## 実行

```sh
deno task example:dependency-graph
```

OSS の validate タスク:

```sh
deno task validate:example
```

## 関連

| トピック       | Example                                        |
| -------------- | ---------------------------------------------- |
| HTTP + inspect | 各 adapter example の `export const container` |
| provider       | [provider-patterns](../provider-patterns/)     |
