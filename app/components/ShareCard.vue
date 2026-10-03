<script setup lang="ts">
import type { AnalysisResult } from '~/server/api/analyze.post'

const props = defineProps<{
  result: AnalysisResult
  decision: string
  optionALabel: string
  optionBLabel: string
}>()

const isGenerating = ref(false)

const winnerLabel = computed(() => {
  if (props.result.recommendation === 'A') return props.optionALabel
  if (props.result.recommendation === 'B') return props.optionBLabel
  return null
})

async function downloadCard() {
  isGenerating.value = true
  try {
    const canvas = document.createElement('canvas')
    const W = 800
    const H = 460
    canvas.width = W * 2
    canvas.height = H * 2
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)

    // 背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // 枠線
    ctx.strokeStyle = '#262626'
    ctx.lineWidth = 1
    roundRect(ctx, 8, 8, W - 16, H - 16, 16)
    ctx.stroke()

    // ヘッダー
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillStyle = '#fbbf24'
    ctx.fillText('Regret.less', 32, 52)
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillStyle = '#525252'
    ctx.fillText('後悔最小化フレームワーク', W - 200, 52)

    // 決断タイトル
    ctx.font = 'bold 18px system-ui, sans-serif'
    ctx.fillStyle = '#e5e5e5'
    ctx.fillText(`「${truncate(props.decision, 30)}」`, 32, 96)

    // スコアカード A
    drawScoreBox(ctx, 32, 120, 340, 180,
      '選択肢 A', props.optionALabel,
      props.result.optionA.regretScore, '#1e3a5f', '#60a5fa')

    // スコアカード B
    drawScoreBox(ctx, 392, 120, 340, 180,
      '選択肢 B', props.optionBLabel,
      props.result.optionB.regretScore, '#052e16', '#34d399')

    // 提言
    if (winnerLabel.value) {
      ctx.fillStyle = '#451a03'
      roundRect(ctx, 32, 320, W - 64, 60, 12)
      ctx.fill()
      ctx.font = '14px system-ui, sans-serif'
      ctx.fillStyle = '#fcd34d'
      ctx.textAlign = 'center'
      ctx.fillText(`80歳の自分への提言：「${truncate(winnerLabel.value, 20)}」の後悔リスクが低い`, W / 2, 356)
      ctx.textAlign = 'left'
    }

    // フッター
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillStyle = '#404040'
    ctx.textAlign = 'center'
    ctx.fillText('github.com/regret-less  |  #KiroUniversity #BuildWithKiro', W / 2, H - 20)
    ctx.textAlign = 'left'

    // ダウンロード
    const link = document.createElement('a')
    link.download = 'regret-less-result.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    isGenerating.value = false
  }
}

function drawScoreBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  label: string, optionLabel: string,
  score: number, bgColor: string, accentColor: string
) {
  ctx.fillStyle = bgColor
  roundRect(ctx, x, y, w, h, 12)
  ctx.fill()

  ctx.font = '11px system-ui, sans-serif'
  ctx.fillStyle = accentColor
  ctx.textAlign = 'center'
  ctx.fillText(label, x + w / 2, y + 24)

  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.fillStyle = '#e5e5e5'
  ctx.fillText(truncate(optionLabel, 18), x + w / 2, y + 52)

  const scoreColor = score >= 60 ? '#f87171' : '#34d399'
  ctx.font = 'bold 52px system-ui, sans-serif'
  ctx.fillStyle = scoreColor
  ctx.fillText(String(score), x + w / 2, y + 126)

  ctx.font = '11px system-ui, sans-serif'
  ctx.fillStyle = '#737373'
  ctx.fillText('後悔リスクスコア / 100', x + w / 2, y + 152)
  ctx.textAlign = 'left'
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}
</script>

<template>
  <div class="space-y-4">
    <!-- シェアカード（プレビュー） -->
    <div class="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4">
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
