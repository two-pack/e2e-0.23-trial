# e2e-0.23-trial

[English](README.md)

[e2e](https://e2e.com) を開発している TesterArmy と、e2e に貢献しているすべての方に感謝します。この試用は、その成果の上に成り立っています。

e2e 0.23 の新機能「Use your Claude Code subscription」を試した記録です。エージェントステップ、つまり `agent.act` と `agent.assert` を、ご自身の Claude のログインで動く Claude Code に実行させます。Claude Code との接続には ACP を使います。ACP は Agent Client Protocol の略で、ツールからコーディングエージェントを呼び出すための共通の取り決めです。別のモデル提供元の設定は要りません。

- リリース記事: https://e2e.com/blog/e2e-0.23
- ガイド: https://e2e.com/docs/subscriptions#use-your-coding-agent

このリポジトリは試用の記録です。手順ごとにコミットを分け、テストを実行するたびに出力もコミットしているので、e2e が何を書き出すのかを確認できます。

## 内容

| パス | 内容 |
| --- | --- |
| `app/` | 小さな ToDo アプリです。1つの HTML と、依存パッケージのない Node.js のサーバーでできています。タイトルは必須で、20 文字までです。 |
| `e2e.config.ts` | `web()` の対象が1つあります。アプリは e2e 自身が `app.command` で空いているポートに起動します。エージェントのステップには `claudeCode({ model: 'sonnet' })` を使います。 |
| `tests/example.e2e.ts` | e2e が作成したサンプルテストです。アプリを開くだけで、モデルは使いません。 |
| `tests/agent-smoke.e2e.ts` | `agent.assert` が1つだけのテストです。Claude Code が ACP 経由で動くことを確かめます。 |
| `tests/add-todo.e2e.ts` | `agent.act` と `agent.assert` を使うテストが2つあります。ToDo を追加する成功の例と、タイトルを空にして追加ボタンを押す失敗の例です。 |
| `.e2e/` | 実行の出力です。`report.json`、`results/` のスクリーンショット、`cache/` の再生の記録が入っています。 |

`e2e init` は、コーディングエージェント向けのファイルも生成します。`.agents/`、`.claude/skills/`、`.mcp.json` などです。このリポジトリには含めていません。

## 必要な環境

- Node.js 24.8 以上です。Node.js 22 なら 22.22.3 以上です。Windows では WSL の中で実行します。
- Claude Code をインストールし、`claude` でログインしておきます。

e2e のドキュメントには `claude` でサインインするか、`ANTHROPIC_API_KEY` を設定すると書かれています。両方を設定したときにどちらが優先されるかは、書かれていません。この試用では `ANTHROPIC_API_KEY` を設定していません。ログインを使いたい場合は、`ANTHROPIC_API_KEY` を外しておいてください。

ACP のアダプタのコードによると、エージェントのステップは `@anthropic-ai/claude-agent-sdk` に同梱された Claude Code の実行ファイルで動きます。環境変数 `CLAUDE_CODE_EXECUTABLE` を設定したときは、そちらが使われます。この試用では未設定で、同梱の Claude Code はバージョン 2.1.318 です。インストール済みの `claude` はバージョン 2.1.319 で、サインインに使われています。

試した環境は WSL2 上の Node.js 24.22.2 と npm 11.19.1 です。パッケージは `e2e` 0.23.0、`@e2e-dev/web` 0.15.5、`@e2e-dev/acp` 0.1.1、`@agentclientprotocol/claude-agent-acp` 0.101.0 を使いました。

## 実行方法

```bash
git clone https://github.com/two-pack/e2e-0.23-trial.git
cd e2e-0.23-trial
npm install
npx e2e doctor
npm run test:e2e
```

- `e2e doctor` は Node.js、設定、ブラウザを確認します。executor が `claude-code` のときは、モデルの行が `?` になります。エージェントが自分のログインを使い、`doctor` はそれを確認しないからです。ログインが使えるかどうかはエージェントのステップを実行して確かめます。
- クローンした状態にはすでに `.e2e/cache/` があります。キャッシュのキーには、プロジェクト ID、テストの ID、指示と引数、エンジンの名前が入り、マシン固有の値は入りません。再生を共有するにはキャッシュをコミットすると、e2e のドキュメントにも書かれています。そのため、1回目の実行から2つの `act` が再生され、下の表の2行目と同じ形になる見込みです。別のマシンでは試していません。再生されなければ、表の1行目と同じ形になります。
- 実行すると、コミット済みの `.e2e/` の出力が上書きされます。
- 最初の実行で、Chromium をダウンロードすることがあります。素の Linux や WSL では、先に `npx @e2e-dev/web install chromium --with-deps` が必要な場合があります。

表の1行目を再現するには、別のクローンで実行します。実行するとコミット済みの出力が上書きされ、同じクローンではコミットの切り替えが妨げられるためです。`17b0bd9` は最初のキャッシュを記録する前のコミットです。

```bash
git clone https://github.com/two-pack/e2e-0.23-trial.git first-run
cd first-run
git checkout 17b0bd9
npm install
npm run test:e2e
```

## 実行で分かったこと

各行の数字は、実行ごとの4つのテスト、つまり e2e が作成したサンプルテスト、スモークテスト、ToDo の2つのテストの合計です。2列目のコミットにある `report.json` から取りました。

| 実行 | 記録のコミット | キャッシュ | モデルの呼び出し | AI のトークン | 所要時間 |
| --- | --- | --- | --- | --- | --- |
| 1回目、記録なし | `3496014` | 2 missed | 5 | 152.1k | 27.15 秒 |
| 2回目 | `aaab722` | 2 replayed | 3 | 74.3k | 11.02 秒 |
| ボタンを `Add` から `Add todo` に変えた後の1回目 | `1fa76a4` | 1 handed off、1 missed | 5 | 164.2k | 50.48 秒 |
| その後のもう1回 | `d279c5c` | 2 replayed | 3 | 74.4k | 10.29 秒 |

- `report.json` の `step.cache.mode` では、表の `replayed` が `self-finalized`、`handed off` が `agent-concluded`、`missed` が `missed` です。対応は [e2e のキャッシュのドキュメント](https://e2e.com/docs/cache) にあります。
- ACP はモデルへのリクエストを報告しないので、e2e はエージェントとの1往復をモデル1回として数えています。トークンの大半はキャッシュの読み出しで、1回目の 152.1k のうち 137.7k がそうです。
- 最初の記録 `fce7137` はサンプルテストとスモークテストだけの実行です。6.64 秒で、モデルの呼び出しは1回、トークンは 24.7k でした。
- 記録して再生するのは `agent.act` だけです。`agent.assert` は毎回モデルを呼びます。2回目の実行では、2つの `act` が 0.25 秒と 0.19 秒でモデルを呼ばずに終わり、3つの `assert` は1回ずつモデルを呼びました。
- 記録は、あとに続く確認が通ったときに保存されます。ここでは、各 `act` のあとの `agent.assert` がその確認でした。
- ボタンの名前を変えると、記録していた `tap button "Add"` が見つからなくなりました。理由は `target-not-found` です。`adds a todo` では、入力の操作は再生され、ボタンを押す操作でエージェントが引き継ぎました。`rejects an empty title` では、エージェントがステップ全体を実行しました。2つの `act` は 20.93 秒と 22.45 秒かかり、何も記録がなかった1回目の 7.81 秒と 6.73 秒より長くなりました。e2e のドキュメントによると、`target-not-found` は記録したコントロールが 15 秒以内に現れなかった場合の判定です。キャッシュの記録は `Add todo` に書き換わりました。
- スモークテストの `assert` は「an Add button」と書いてあっても、名前を変えたあとで通りました。
- `report.json` の `estimatedCostUsd` は e2e が計算した見積もりです。実際の請求額ではありません。

数字は1台のマシンで数回実行した結果です。ベンチマークではなく、例として見てください。

## コミットした出力について

`e2e init` は `.e2e/results/`、`.e2e/report.json`、`.e2e/cache/` を `.gitignore` に入れます。このリポジトリでは、この3行を意図的に外しています。コミット「Track e2e results, report and replay cache」を見てください。`sessions/`、`logs/`、`videos/`、`ai-trace.json`、`junit.xml`、`summary.md` は無視したままです。

- `report.json` は実行のたびに変わります。アプリに割り当てられたポートと、実行を始めたときのコミットと枝名が記録されます。
- `report.json` にはログインと API キーのどちらで認証したかは記録されません。
- キャッシュには入力した値が入力したままの形で残ります。キャッシュを共有する前に、中身を確認してください。ここで入力した値は `Buy milk` だけです。
- コミットしたキャッシュが別のマシンで再生されるかどうかは確かめていません。

## 履歴の読み方

```bash
git log --reverse --format='%h %s'
```

コードの変更と実行の記録は別のコミットです。「Record ...」という名前のコミットに実行の出力が入っています。

## ライセンス

MIT です。[LICENSE](LICENSE) を見てください。
