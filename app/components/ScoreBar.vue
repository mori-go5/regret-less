<script setup lang="ts">
const props = defineProps<{
  label: string
  score: number
  color: 'blue' | 'emerald'
  isWinner: boolean
}>()

const colorClass = computed(() =>
  props.color === 'blue' ? 'bg-blue-400' : 'bg-emerald-400'
)

const textColorClass = computed(() =>
  props.color === 'blue' ? 'text-blue-400' : 'text-emerald-400'
)

// スコアが高いほど後悔リスクが高い = 赤寄りに
const barColor = computed(() => {
  if (props.score >= 70) return 'bg-red-500'
  if (props.score >= 40) return 'bg-amber-500'
  return 'bg-emerald-500'
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span :class="[textColorClass, 'font-semibold text-sm']">{{ label }}</span>
        <span v-if="isWinner" class="text-xs bg-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full">
          後悔リスク低
        </span>
      </div>
      <span class="text-2xl font-bold text-neutral-100">{{ score }}<span class="text-sm text-neutral-500">/100</span></span>
    </div>
    <div class="h-3 bg-neutral-800 rounded-full overflow-hidden">
      <div
        :class="[barColor, 'h-full rounded-full transition-all duration-700']"
        :style="{ width: `${score}%` }"
      />
    </div>
    <p class="text-xs text-neutral-600">後悔リスクスコア（高いほど後悔しやすい）</p>
  </div>
</template>
