# dependency-graph

`container.inspect()` と `container.validate()` で依存グラフを確認する例です。`export const container` が composition root です。

## 学ぶこと

- 依存グラフのノード・エッジ
- Mermaid / DOT 形式への export（`graphToMermaid` / `graphToDot`）
- バリデーション issue（循環依存・lifetime 違敗・未使用 provider 等）

## 実行

```sh
deno task example:dependency-graph
```

OSS の validate タスク:

```sh
deno task validate:example
```

## Wyrly Pro CLI（任意）

`wyrly doctor` / `wyrly graph` / CI 向け `validate --format json` などは **Wyrly Pro**（非公開リポジトリ）の CLI です。entry の例:

```sh
# Wyrly Pro 側（../pro）から
deno task wyrly validate -- --entry ../oss/examples/dependency-graph/main.ts
```

## 関連

| トピック | Example |
| -------- | ------- |
| HTTP + inspect | 各 adapter example の `export const container` |
| provider | [provider-patterns](../provider-patterns/) |
