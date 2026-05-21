# Wyrly DI（日本語）

English: [README.md](README.md)

利用者向けドキュメントの日本語版です（v1.0.0 関連セクション）。全文の英語版は [README.md](README.md)
を参照してください。

## ドキュメント

| 文書                                           | 内容                               |
| ---------------------------------------------- | ---------------------------------- |
| [API.ja.md](API.ja.md)                         | 公開 API（v1.0 固定）              |
| [CHANGELOG.ja.md](CHANGELOG.ja.md)             | 変更履歴                           |
| [PUBLISHING.ja.md](PUBLISHING.ja.md)           | JSR / npm 公開・利用者向け import  |
| [examples/README.ja.md](examples/README.ja.md) | サンプル一覧・実行方法             |
| [AGENT.md](AGENT.md)                           | コントリビュータ向けガイド（英語） |

## インストール

**v1.0.0** — **JSR** / **npm** から利用するか、本リポジトリを workspace として開発します。詳細は
[PUBLISHING.ja.md](PUBLISHING.ja.md)。

### JSR（Deno）

```jsonc
{
  "imports": {
    "@wyrly/core": "jsr:@wyrly/core@^1.0.0"
  }
}
```

```ts
import { createContainer, token } from "@wyrly/core";
```

### npm（Node 等）

```sh
npm install @wyrly/core
```

```ts
import { createContainer, token } from "@wyrly/core";
```

adapter は必要に応じて追加（例: `npm install @wyrly/next`）。**`@wyrly/fresh` は JSR のみ**（Fresh 2.x に npm パッケージなし）。公開手順は [PUBLISHING.ja.md](PUBLISHING.ja.md)（[dnt](https://github.com/denoland/dnt) でビルド）。

### 本リポジトリでの開発

```sh
git clone <your-fork-or-upstream-url>
cd wyrly/oss
deno task check
deno task test
```

```ts
import { createContainer, token } from "@wyrly/core";
```

## ステータス

**v1.0.0** — `@wyrly/core` と各 adapter は [API.ja.md](API.ja.md)
に記載の公開面を安定版として扱います。変更内容は [CHANGELOG.ja.md](CHANGELOG.ja.md)
を参照してください。

## API の安定性

**1.0.0** 以降、公開 API は [API.ja.md](API.ja.md) に列挙したシンボルに対して
[Semantic Versioning](https://semver.org/lang/ja/) を適用します。

## ランタイムの言語（i18n）

エラーや `validate()` の表示文は実行環境（`LANG`、`WYRLY_LOCALE`
など）から自動判定されます。`container.validate({ locale: "ja" })` でも指定できます。

## CLI について

`wyrly` CLI（doctor / graph / validate / generate）は **Wyrly Pro**（非公開・商用）です。この OSS
リポジトリには含まれません。

CI では `container.validate()` や [examples/dependency-graph](examples/dependency-graph/)
を利用できます（[examples/README.ja.md](examples/README.ja.md) 参照）。
