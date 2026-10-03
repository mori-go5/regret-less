<script setup lang="ts">
import { useDecisionAnalysis } from '~/composables/useDecisionAnalysis'

useHead({ title: 'Regret.less — 分析結果' })

const { analysisResult, decisionInput, reset } = useDecisionAnalysis()
const router = useRouter()

// 結果がなければトップへリダイレクト
onMounted(() => {
  if (!analysisResult.value || !decisionInput.value) {
    router.replace('/')
  }
})

const result = computed(() => analysisResult.value!)
const input = computed(() => decisionInput.value!)

const winnerText = computed(() => {
  if (!result.value) return ''
  if (result.value.recommendation === 'A') return `「${input.value.optionA}」の後悔リスクが低い`
  if (result.value.recommendation === 'B') return `「${input.value.optionB}」の後悔リスクが低い`
  return '両者の後悔リスクはほぼ同等'
})

function goBack() {
  reset()
  router.push('/')
}
</script>

<template>
  <div v-if="result && input" class="max-w-3xl mx-auto px-4 py-12 space-y-10">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between">
      <button
        class="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
        @click="goBack"
      >
        ← 別の決断を分析する
      </button>
      <span class="text-amber-400 font-bold">Regret.less</span>
    </div>

    <!-- 決断タイトル -->
    <div class="text-center">
      <p class="text-neutral-500 text-sm mb-1">あなたの決断</p>
      <h2 class="text-2xl font-bold text-neutral-100">「{{ input.decision }}」</h2>
    </div>

    <!-- 後悔リスクスコア -->
    <section class="bg-neutral-900 rounded-2xl p-6 space-y-5">
      <h3 class="text-neutral-300 font-semibold text-sm uppercase tracking-wider">後悔リスクスコア</h3>
      <ScoreBar
        :label="`A: ${input.optionA}`"
        :score="result.optionA.regretScore"
        color="blue"
        :is-winner="result.recommendation === 'A'"
      />
      <ScoreBar
        :label="`B: ${input.optionB}`"
        :score="result.optionB.regretScore"
        color="emerald"
        :is-winner="result.recommendation === 'B'"
      />
      <div class="bg-amber-950/50 border border-amber-800/50 rounded-xl p-4 text-center">
        <p class="text-amber-300 font-semibold">{{ winnerText }}</p>
      </div>
    </section>

    <!-- 可逆性警告 -->
    <div
      v-if="result.optionA.reversibilityWarning || result.optionB.reversibilityWarning"
      class="bg-red-950/50 border border-red-800/50 rounded-xl p-4"
    >
      <p class="text-red-400 font-semibold mb-1">⚠️ 注意</p>
      <p v-if="result.optionA.reversibilityWarning" class="text-red-300 text-sm">
        「{{ input.optionA }}」は<strong>やり直しが難しい選択</strong>です。慎重に検討してください。
      </p>
      <p v-if="result.optionB.reversibilityWarning" class="text-red-300 text-sm">
        「{{ input.optionB }}」は<strong>やり直しが難しい選択</strong>です。慎重に検討してください。
      </p>
    </div>

    <!-- レーダーチャート -->
    <section class="bg-neutral-900 rounded-2xl p-6">
      <h3 class="text-neutral-300 font-semibold text-sm uppercase tracking-wider mb-6">6軸評価</h3>
      <div class="max-w-sm mx-auto">
        <ClientOnly>
          <RadarChart
            :option-a-axes="result.optionA.axes"
            :option-b-axes="result.optionB.axes"
            :option-a-label="`A: ${input.optionA}`"
            :option-b-label="`B: ${input.optionB}`"
          />
        </ClientOnly>
      </div>
    </section>

    <!-- タイムライン -->
    <section class="bg-neutral-900 rounded-2xl p-6">
      <h3 class="text-neutral-300 font-semibold text-sm uppercase tracking-wider mb-6">時系列予測</h3>
      <Timeline
        :option-a-timeline="result.optionA.timeline"
        :option-b-timeline="result.optionB.timeline"
        :option-a-label="input.optionA"
        :option-b-label="input.optionB"
      />
    </section>

    <!-- AIコメント -->
    <section class="bg-neutral-900 rounded-2xl p-6 space-y-4">
      <h3 class="text-neutral-300 font-semibold text-sm uppercase tracking-wider">AI分析コメント</h3>
      <p class="text-neutral-200 leading-relaxed">{{ result.commentary }}</p>
      <div class="bg-purple-950/50 border border-purple-800/50 rounded-xl p-4">
        <p class="text-purple-400 text-sm font-semibold mb-1">🔮 本音の気づき</p>
        <p class="text-purple-200 text-sm">{{ result.intuitionReveal }}</p>
      </div>
    </section>

    <!-- シェアカード -->
    <section class="bg-neutral-900 rounded-2xl p-6">
      <h3 class="text-neutral-300 font-semibold text-sm uppercase tracking-wider mb-4">結果をシェアする</h3>
      <ClientOnly>
        <ShareCard
          :result="result"
          :decision="input.decision"
          :option-a-label="input.optionA"
          :option-b-label="input.optionB"
        />
      </ClientOnly>
    </section>
  </div>
</template>
