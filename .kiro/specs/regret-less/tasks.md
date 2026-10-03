# Regret.less — Implementation Tasks

## Phase 1: Foundation

- [x] Initialize Nuxt 4 project with Tailwind CSS v4
- [x] Create .kiro directory structure (specs, steering, hooks, agents)
- [ ] Create server/api/analyze.post.ts (OpenAI proxy)
- [ ] Create useDecisionAnalysis composable

## Phase 2: UI — Input

- [ ] Create app/pages/index.vue (decision input form)
- [ ] Create app/components/DecisionForm.vue with validation
- [ ] Create app/components/LoadingOverlay.vue

## Phase 3: UI — Results Dashboard

- [ ] Create app/pages/result.vue (results dashboard)
- [ ] Create app/components/ScoreBar.vue (regret risk score bars)
- [ ] Create app/components/RadarChart.vue (Chart.js radar)
- [ ] Create app/components/Timeline.vue (1yr/5yr/10yr/80yr)
- [ ] Create app/components/ShareCard.vue (SNS share card)

## Phase 4: Share & Export

- [ ] Implement html2canvas PNG export in ShareCard.vue
- [ ] Add copy-to-clipboard for share text

## Phase 5: Quality & Kiro Features

- [ ] Write property-based tests (tests/scoring.property.test.ts)
- [ ] Create MCP server (mcp-server.js) with decision history tools
- [ ] Create custom agents (.kiro/agents/)
- [ ] Final review and README update
