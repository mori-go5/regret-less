import type { AnalysisResult } from '~/server/api/analyze.post'

export interface DecisionInput {
  decision: string
  optionA: string
  optionB: string
  age: number
}

// セッション間で分析結果を保持するグローバル状態
const analysisResult = ref<AnalysisResult | null>(null)
const decisionInput = ref<DecisionInput | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

export function useDecisionAnalysis() {
  async function analyze(input: DecisionInput): Promise<boolean> {
    isLoading.value = true
    errorMessage.value = null

    try {
      const result = await $fetch<AnalysisResult>('/api/analyze', {
        method: 'POST',
        body: input,
      })
      analysisResult.value = result
      decisionInput.value = input
      return true
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : 'AI分析に失敗しました。もう一度お試しください。'
      errorMessage.value = msg ?? 'AI分析に失敗しました。もう一度お試しください。'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    analysisResult.value = null
    decisionInput.value = null
    errorMessage.value = null
  }

  return {
    analysisResult: readonly(analysisResult),
    decisionInput: readonly(decisionInput),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    analyze,
    reset,
  }
}
