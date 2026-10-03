<script setup lang="ts">
import type { AnalysisResult } from '~/server/api/analyze.post'

const props = defineProps<{
  result: AnalysisResult
  decision: string
  optionALabel: string
  optionBLabel: string
}>()

const cardRef = ref<HTMLElement | null>(null)
const isGenerating = ref(false)

async function downloadCard() {
  if (!cardRef.value) return
  isGenerating.value = true
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: '#0a0a0a',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = 'regret-less-result.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    isGenerating.value = false
  }
}

const winnerLabel = computed(() => {
  if (props.result.recommendation === 'A') return props.optionALabel
  if (props.result.recommendation === 'B') return props.optionBLabel
  return null
})
</script>

<template>
  <div class="space-y-4">
    <!-- シェアカード（キャプチャ対象） -->
    <div
      ref="cardRef"
      class="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <span class="text-amber-400 font-bold text-lg">Regret.less</span>
        <span class="text-neutral-600 text-xs">後悔最小化フレームワーク</span>
      </div>

      <p class="text-neutral-200 font-semibold text-base">「{{ decision }}」</p>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-blue-950/50 rounded-xl p-3 text-center">
          <p class="text-blue-400 text-xs mb-1">選択肢 A</p>
          <p class="text-neutral-200 text-sm font-medium">{{ optionALabel }}</p>
          <p class="text-2xl font-bold mt-2" :class="result.optionA.regretScore >= 60 ? 'text-red-400' : 'text-emerald-400'">
            {{ result.optionA.regretScore }}
          </p>
          <p class="text-neutral-600 text-xs">後悔リスク</p>
        </div>
        <div class="bg-emerald-950/50 rounded-xl p-3 text-center">
          <p class="text-emerald-400 text-xs mb-1">選択肢 B</p>
          <p class="text-neutral-200 text-sm font-medium">{{ optionBLabel }}</p>
          <p class="text-2xl font-bold mt-2" :class="result.optionB.regretScore >= 60 ? 'text-red-400' : 'text-emerald-400'">
            {{ result.optionB.regretScore }}
          </p>
          <p class="text-neutral-600 text-xs">後悔リスク</p>
        </div>
      </div>

      <div v-if="winnerLabel" class="bg-amber-950/50 border border-amber-800/50 rounded-xl p-3 text-center">
        <p class="text-amber-400 text-sm">
          80歳の自分への提言：<span class="font-bold">「{{ winnerLabel }}」</span>の後悔リスクが低い
        </p>
      </div>

      <p class="text-neutral-600 text-xs text-center">regret-less.vercel.app</p>
    </div>

    <!-- ダウンロードボタン -->
    <button
      :disabled="isGenerating"
      class="w-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      @click="downloadCard"
    >
      <span>{{ isGenerating ? '生成中...' : '📥 シェアカードをダウンロード (PNG)' }}</span>
    </button>
  </div>
</template>
