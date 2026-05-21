# explicit-deps

デコレターなしで `register({ deps: [...] })` だけで依存を宣言する例です。

## 学ぶこと

- `@Injectable` を使わない明示的 provider 登録
- コンストラクタ注入と同じ解決モデル

## 実行

```sh
deno task example:explicit-deps
```

## 関連

| トピック       | Example                                    |
| -------------- | ------------------------------------------ |
| デコレター利用 | [basic-ddd](../basic-ddd/)                 |
| factory        | [provider-patterns](../provider-patterns/) |
