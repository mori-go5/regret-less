# Regret.less 🔮

> この決断、後悔する？ — 80歳の自分から見た意思決定ビジュアライザー

[![Kiro University Challenge](https://img.shields.io/badge/Kiro%20University-Challenge%202026-amber)](https://kiro.dev/2026/university/)

## 概要

**Regret.less** は Jeff Bezos の「後悔最小化フレームワーク（Regret Minimization Framework）」を AI で可視化するWebアプリです。

「転職する？しない？」「独立する？しない？」——迷っている2択を入力するだけで、80歳の自分の視点から後悔リスクをスコアリング・可視化します。

### 主な機能

- 🎯 **後悔リスクスコア** — 選択肢A/Bの後悔リスクを0〜100でスコアリング
- 🕸️ **6軸レーダーチャート** — 感情的後悔・機会損失・可逆性・成長可能性・周囲への影響・直感スコアを可視化
- 📅 **時系列タイムライン** — 1年後・5年後・10年後・80歳の視点での予測
- 🔮 **本音の気づき** — 入力文章のトーンからユーザーの潜在的な本音をAIが読み取る
- 📱 **SNSシェアカード** — 結果をPNG画像でダウンロードしてXにシェア

## 技術スタック

- **Framework**: Nuxt 4 + Vue 3
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js + vue-chartjs
- **AI**: OpenAI GPT-4o-mini
- **Testing**: Vitest + fast-check (Property-based testing)

## セットアップ

```bash
pnpm install
```

`.env` ファイルを作成:

```
NUXT_OPENAI_API_KEY=sk-...
```

```bash
pnpm dev
```

## テスト

```bash
pnpm test
```

Property-based tests (fast-check) で後悔リスクスコアのロジックを検証します。

## Kiro University Challenge — 実装したレッスン

| # | レッスン | 実装内容 | ファイル |
|---|---|---|---|
| 1 | Spec-driven development | EARS記法による要件・設計・タスク | `.kiro/specs/regret-less/` |
| 2 | Steering documents | Vue/TypeScript コーディング規約 | `.kiro/steering/vue-conventions.md` |
| 3 | Hooks | TypeScript型チェック + APIルート検証 | `.kiro/hooks/hooks.json` |
| 4 | Property-based testing | スコアロジックの不変条件テスト（fast-check） | `tests/scoring.property.test.ts` |
| 5 | Powers | 意思決定フレームワークのKiro Power | `power/` |
| 6 | MCP | 意思決定履歴を管理するMCPサーバー | `mcp-server.js` |
| 7 | Custom agents | DecisionCoachAgent / RegretAnalyzerAgent | `.kiro/agents/` |

## .kiro ディレクトリ構造

```
.kiro/
├── specs/regret-less/
│   ├── requirements.md   # EARS記法による要件定義
│   ├── design.md         # アーキテクチャ設計
│   └── tasks.md          # 実装タスクリスト
├── steering/
│   └── vue-conventions.md
├── hooks/
│   └── hooks.json
├── agents/
│   ├── DecisionCoachAgent.md
│   └── RegretAnalyzerAgent.md
└── settings/
    └── mcp.json
```

## MCPサーバー

意思決定の履歴をローカルに保存し、Kiroエージェントから参照できます。

```bash
node mcp-server.js
```

利用可能なツール:
- `save_decision` — 意思決定を記録
- `get_decisions` — 過去の意思決定一覧
- `get_decision_patterns` — 意思決定パターン分析

---

Built with [Kiro](https://kiro.dev) for the [Kiro University Challenge 2026](https://kiro.dev/2026/university/) 🎓

`#KiroUniversity` `#BuildWithKiro`
