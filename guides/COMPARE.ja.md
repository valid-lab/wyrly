# Wyrly DI の比較

Wyrly DI は、`reflect-metadata`、`emitDecoratorMetadata`、parameter
decorators、自動的な実行時型推測に依存せず、明示的で解析しやすい依存性注入を求めるモダン TypeScript
チーム向けの DI ツールキットです。

フルスタックフレームワークを目指すものではありません。core
は小さく保ち、Next.js、Hono、Express、Fresh、GraphQL との連携は adapter に分けています。

## 比較表

| 観点                    | Wyrly DI                                 | metadata 系 DI                       | Typed Inject 系 DI               |
| ----------------------- | ---------------------------------------- | ------------------------------------ | -------------------------------- |
| 標準デコレーター        | `@Injectable({ deps })` で主役として扱う | legacy decorator 前提が多い          | decorator 中心ではないことが多い |
| `reflect-metadata`      | 不要                                     | 必要なことが多い                     | 不要                             |
| `emitDecoratorMetadata` | 不要                                     | 必要なことが多い                     | 不要                             |
| parameter decorators    | 使わない                                 | よく使われる                         | 使わない                         |
| interface 注入          | 型付き `token<T>()`                      | class / string / symbol token が中心 | string token が中心になりやすい  |
| request scope           | core concept + 公式 adapter              | ライブラリ次第                       | 可能だが汎用寄り                 |
| DDD / composition root  | 明示的配線を標準にする                   | auto scan / decorator と混ざりやすい | 明示的だが Web 導線は薄め        |
| 依存グラフ解析          | `inspect()`、`validate()`、graph export  | ライブラリ次第                       | 弱いことが多い                   |

## Wyrly DI が向いているケース

- Next.js App Router、Hono、Express、Fresh、GraphQL、Deno、Bun、Node.js、Cloudflare Workers で
  TypeScript Web アプリを作っている。
- legacy decorator metadata に依存しない DI が欲しい。
- 自動スキャンより composition root で明示的に配線したい。
- DDD / クリーンアーキテクチャで、依存関係を境界に見える形で残したい。
- lifetime や依存グラフを CI で検証したい。

## 別の選択肢が向いているケース

- module、controller、pipe、guard などを含むフルフレームワークが欲しい。
- 既に `reflect-metadata` と parameter decorators に深く依存している。
- 明示的登録より、自動探索 / glob scan を優先したい。
- 小さく明示的な core より、成熟したプラグインエコシステムが重要。

## ポジショニング

Wyrly DI は、小さな明示的 DI コンテナと重い decorator metadata
系フレームワークの中間に置く設計です。

```txt
小さな明示的 DI      <  Wyrly DI  <  フルフレームワーク
汎用的な配線         <  Web request scope + DDD examples
runtime metadata 魔法 <  明示的 deps + 解析可能な graph
```

## 導入ステップ

1. まず [`@wyrly/core`](../packages/core/README.ja.md) を 1 つの composition root で使う。
2. interface ベースの依存には型付き token を使う。
3. Web ランタイムに合わせて adapter を追加する。
4. 自分の構成に近い example を実行する。
   - [Next.js App Router](../examples/next-ddd/)
   - [Hono / Cloudflare Workers](../examples/hono-api/)
   - [GraphQL / DataLoader](../examples/graphql-request/)
   - [DDD composition root](../examples/basic-ddd/)
5. lifetime が増えてきたら、テストや CI で `container.validate()` を使う。

## 関連

- [tsyringe からの移行](./MIGRATING_FROM_TSYRINGE.ja.md)
- [InversifyJS からの移行](./MIGRATING_FROM_INVERSIFY.ja.md)
- [Server Components ガイド](./SERVER_COMPONENTS.ja.md)
