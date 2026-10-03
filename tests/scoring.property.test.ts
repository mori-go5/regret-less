/**
 * Property-based tests for Regret.less scoring logic
 * Lesson 4: Property-based testing (PBT) with fast-check
 *
 * These tests verify the invariants that must hold for ALL possible
 * analysis results — regardless of what the AI returns.
 */
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// AnalysisResult の型定義（テスト用）
interface OptionAxes {
  emotionalRegret: number
  opportunityLoss: number
  reversibility: number
  growthPotential: number
  impactOnOthers: number
  intuitionScore: number
}

interface OptionResult {
  regretScore: number
  axes: OptionAxes
  reversibilityWarning: boolean
}

interface AnalysisResult {
  optionA: OptionResult
  optionB: OptionResult
  recommendation: 'A' | 'B' | 'neutral'
}

// テスト対象のビジネスロジック関数
function computeReversibilityWarning(reversibility: number): boolean {
  return reversibility < 30
}

function computeRecommendation(
  scoreA: number,
  scoreB: number
): 'A' | 'B' | 'neutral' {
  const diff = Math.abs(scoreA - scoreB)
  if (diff <= 10) return 'neutral'
  return scoreA < scoreB ? 'A' : 'B'
}

function normalizeScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

// Arbitraries（生成器）
const scoreArb = fc.integer({ min: 0, max: 100 })
const axesArb = fc.record({
  emotionalRegret: scoreArb,
  opportunityLoss: scoreArb,
  reversibility: scoreArb,
  growthPotential: scoreArb,
  impactOnOthers: scoreArb,
  intuitionScore: scoreArb,
})

describe('Property 1: すべてのスコアは [0, 100] の範囲内', () => {
  it('normalizeScore は常に 0〜100 を返す', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), (value) => {
        const normalized = normalizeScore(value)
        expect(normalized).toBeGreaterThanOrEqual(0)
        expect(normalized).toBeLessThanOrEqual(100)
      }),
      { numRuns: 200 }
    )
  })
})

describe('Property 2: reversibility < 30 なら警告フラグは必ず true', () => {
  it('可逆性スコアが低いとき警告が発火する', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 29 }), (reversibility) => {
        expect(computeReversibilityWarning(reversibility)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('可逆性スコアが 30 以上のとき警告は発火しない', () => {
    fc.assert(
      fc.property(fc.integer({ min: 30, max: 100 }), (reversibility) => {
        expect(computeReversibilityWarning(reversibility)).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property 3: recommendation の整合性', () => {
  it('スコア差が 10 点以内なら neutral を返す', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 10 }),
        (base, diff) => {
          const scoreB = Math.min(100, base + diff)
          const rec = computeRecommendation(base, scoreB)
          // diff <= 10 なら neutral のはず
          expect(rec).toBe('neutral')
        }
      ),
      { numRuns: 200 }
    )
  })

  it('スコア差が 10 点超なら低スコアの方を推奨する', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 80 }),
        fc.integer({ min: 11, max: 20 }),
        (low, diff) => {
          const high = low + diff
          const recAWins = computeRecommendation(low, high)
          const recBWins = computeRecommendation(high, low)
          expect(recAWins).toBe('A') // A が低スコア = A を推奨
          expect(recBWins).toBe('B') // B が低スコア = B を推奨
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 4: 軸データの不変条件', () => {
  it('すべての軸スコアに normalizeScore を通しても値が変わらない（0-100 の入力）', () => {
    fc.assert(
      fc.property(axesArb, (axes) => {
        Object.values(axes).forEach((v) => {
          expect(normalizeScore(v)).toBe(v)
        })
      }),
      { numRuns: 200 }
    )
  })
})
