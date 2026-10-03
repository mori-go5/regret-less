# Regret.less — Design

## Architecture

Nuxt 4 fullstack application with:
- **Frontend**: Vue 3 + Tailwind CSS v4 (SPA-like pages)
- **Backend**: Nuxt server routes (Nitro) acting as a secure proxy to OpenAI API
- **Charts**: Chart.js via vue-chartjs
- **Share card**: html2canvas for PNG export

## Directory Structure

```
regret-less/
├── app/
│   ├── app.vue               # Root layout
│   ├── pages/
│   │   ├── index.vue         # Decision input form (Step 1)
│   │   └── result.vue        # Results dashboard (Step 2)
│   ├── components/
│   │   ├── DecisionForm.vue  # Input form component
│   │   ├── RadarChart.vue    # Chart.js radar chart
│   │   ├── Timeline.vue      # 1yr/5yr/10yr/80yr timeline
│   │   ├── ScoreBar.vue      # Regret risk score bars
│   │   ├── ShareCard.vue     # SNS share card (html2canvas target)
│   │   └── LoadingOverlay.vue
│   └── composables/
│       └── useDecisionAnalysis.ts  # API call + state management
├── server/
│   └── api/
│       └── analyze.post.ts   # OpenAI proxy endpoint
├── .kiro/
│   ├── specs/regret-less/    # This spec
│   ├── steering/             # Coding conventions
│   ├── hooks/                # Automation hooks
│   ├── agents/               # Custom agents
│   └── settings/mcp.json     # MCP server config
└── tests/
    └── scoring.property.test.ts  # Property-based tests
```

## Data Flow

```
User Input (index.vue)
  → useDecisionAnalysis composable
  → POST /api/analyze (server route)
  → OpenAI API (gpt-4o-mini)
  → Structured JSON response
  → result.vue (dashboard)
```

## OpenAI Response Schema

```typescript
{
  optionA: {
    regretScore: number,        // 0-100, higher = more regret risk
    axes: {
      emotionalRegret: number,  // 0-100
      opportunityLoss: number,
      reversibility: number,
      growthPotential: number,
      impactOnOthers: number,
      intuitionScore: number
    },
    timeline: {
      oneYear: string,
      fiveYears: string,
      tenYears: string,
      atEighty: string
    }
  },
  optionB: { /* same structure */ },
  recommendation: "A" | "B" | "neutral",
  commentary: string,           // Japanese plain-language analysis
  intuitionReveal: string       // "本当はBを選びたいのでは？" etc.
}
```

## Correctness Properties (for PBT — Lesson 4)

1. regretScore must always be in range [0, 100]
2. All six axes values must be in range [0, 100]
3. The option with lower regretScore should match the recommendation (or be "neutral" when scores are within 10 points)
4. If reversibility < 30 for an option, the warning flag must be set to true
