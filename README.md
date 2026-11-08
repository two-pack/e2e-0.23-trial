# e2e-0.23-trial

[日本語版 / Japanese](README.ja.md)

Thanks to TesterArmy and everyone who contributes to [e2e](https://e2e.com). This trial builds on their work.

A small trial of the "Use your Claude Code subscription" feature in e2e 0.23.
Agent steps (`agent.act`, `agent.assert`) run on Claude Code, signed in with your own Claude login, through ACP (Agent Client Protocol). No separate model provider is configured.

- Release post: https://e2e.com/blog/e2e-0.23
- Guide: https://e2e.com/docs/subscriptions#use-your-coding-agent

This repository is a record of the trial. Each step is its own commit, and the outputs of each test run are committed too, so you can see what e2e writes.

## What is in here

| Path | What it is |
| --- | --- |
| `app/` | A tiny todo app: one HTML page and a Node.js server without dependencies. A title is required and can be 20 characters at most. |
| `e2e.config.ts` | One `web()` target. e2e starts the app itself (`app.command`) on a free port. Agent steps use `claudeCode({ model: 'sonnet' })`. |
| `tests/example.e2e.ts` | The sample test that e2e created. It only opens the app, and no model is used. |
| `tests/agent-smoke.e2e.ts` | One `agent.assert`. Confirms that Claude Code runs through ACP. |
| `tests/add-todo.e2e.ts` | Two tests, each with `agent.act` and `agent.assert`: adding a todo (success) and pressing the add button with an empty title (failure). |
| `.e2e/` | Outputs of the runs: `report.json`, screenshots in `results/`, and the replay cache in `cache/`. |

`e2e init` also generates files for coding agents (`.agents/`, `.claude/skills/`, `.mcp.json` and others). They are not included here.

## Requirements

- Node.js 24.8 or later, or 22.22.3 or later on Node.js 22. On Windows, run inside WSL.
- Claude Code, installed and signed in (`claude`).

The e2e docs say to sign in with `claude` or to set `ANTHROPIC_API_KEY`. They do not say which one wins when both are set. This trial ran with `ANTHROPIC_API_KEY` unset. Unset it if you want the login to be used.

According to the code of the ACP adapter, the agent steps run on the Claude Code binary that comes with `@anthropic-ai/claude-agent-sdk`, unless `CLAUDE_CODE_EXECUTABLE` is set. It was unset here, and the bundled version is 2.1.318. The installed `claude` (2.1.319) is the one used to sign in.

Tried with Node.js 24.22.2 and npm 11.19.1 on WSL2, with `e2e` 0.23.0, `@e2e-dev/web` 0.15.5, `@e2e-dev/acp` 0.1.1 and `@agentclientprotocol/claude-agent-acp` 0.101.0.

## Run it

```bash
git clone https://github.com/two-pack/e2e-0.23-trial.git
cd e2e-0.23-trial
npm install
npx e2e doctor
npm run test:e2e
```

- `e2e doctor` checks Node.js, the config and the browser. For the `claude-code` executor it prints `?` on the model line, because the agent brings its own login and `doctor` does not check it. The way to see whether the login works is to run an agent step.
- The clone already has `.e2e/cache/`. The cache key holds the project ID, the test ID, the instruction with its params and the engine name, and no machine-specific value. The e2e docs also say to commit the cache to share replays. So your first run should replay the two `act` steps and look like the second row of the table below. This was not tried on another machine. If nothing replays, the run looks like the first row.
- A run overwrites the committed outputs in `.e2e/`.
- The first run may download Chromium. On a bare Linux or WSL, you may need `npx @e2e-dev/web install chromium --with-deps` first.

To see the first row, use a separate clone. A run overwrites the committed outputs, which would block switching commits in the same clone. `17b0bd9` is the commit before the first cache was recorded.

```bash
git clone https://github.com/two-pack/e2e-0.23-trial.git first-run
cd first-run
git checkout 17b0bd9
npm install
npm run test:e2e
```

## What the runs showed

Each row covers all four tests of a run: the sample test that e2e created, the smoke test and the two todo tests. The numbers come from the `report.json` committed in the commit named in the second column.

| Run | Record commit | Cache | Model calls | AI tokens | Duration |
| --- | --- | --- | --- | --- | --- |
| First run, nothing recorded | `3496014` | 2 missed | 5 | 152.1k | 27.15 s |
| Second run | `aaab722` | 2 replayed | 3 | 74.3k | 11.02 s |
| After renaming the button `Add` to `Add todo` | `1fa76a4` | 1 handed off, 1 missed | 5 | 164.2k | 50.48 s |
| Run again | `d279c5c` | 2 replayed | 3 | 74.4k | 10.29 s |

- In `report.json`, `step.cache.mode` is `self-finalized` for `replayed`, `agent-concluded` for `handed off` and `missed` for `missed`. See the [e2e cache docs](https://e2e.com/docs/cache).
- ACP does not report model requests, so e2e counts each round trip with the agent as one model call. Most of the tokens are cache reads: 137.7k of the 152.1k in the first run.
- The first record (`fce7137`) is a run of the sample test and the smoke test only. It took 6.64 s with one model call and 24.7k tokens.
- Only `agent.act` is recorded and replayed. `agent.assert` calls the model every time. In the second run the two `act` steps took 0.25 s and 0.19 s with no model call, and the three `assert` steps still called the model once each.
- A recording is saved after a later check passes. Here the `agent.assert` after each `act` was that check.
- When the button was renamed, the recorded `tap button "Add"` was no longer found (`target-not-found`). In `adds a todo` the typing step replayed and the agent took over at the tap. In `rejects an empty title` the agent ran the whole step. The two `act` steps took 20.93 s and 22.45 s, longer than the 7.81 s and 6.73 s of the first run that had nothing recorded. According to the e2e docs, `target-not-found` means a recorded control did not appear within 15 seconds. The cache entries were rewritten to `Add todo`.
- The `assert` in the smoke test still passed after the rename, although it says "an Add button".
- `estimatedCostUsd` in `report.json` is an estimate computed by e2e, not what you are billed.

The numbers come from one machine and a few runs. Treat them as an illustration, not a benchmark.

## About the committed outputs

`e2e init` adds `.e2e/results/`, `.e2e/report.json` and `.e2e/cache/` to `.gitignore`. This repository removes those three lines on purpose (see the commit "Track e2e results, report and replay cache"). `sessions/`, `logs/`, `videos/`, `ai-trace.json`, `junit.xml` and `summary.md` stay ignored.

- `report.json` changes on every run. It records the port the app got, and the commit and branch the run started on.
- `report.json` does not record whether the login or an API key authenticated the run.
- Cache entries keep typed values as typed. Review them before you share a cache. The only typed value here is `Buy milk`.
- Whether the committed cache replays on another machine was not tested.

## Reading the history

```bash
git log --reverse --format='%h %s'
```

Code changes and run records are separate commits. The commits named "Record ..." hold the outputs of a run.

## License

MIT. See [LICENSE](LICENSE).
