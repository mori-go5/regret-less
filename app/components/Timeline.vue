<script setup lang="ts">
const props = defineProps<{
  optionATimeline: { oneYear: string; fiveYears: string; tenYears: string; atEighty: string }
  optionBTimeline: { oneYear: string; fiveYears: string; tenYears: string; atEighty: string }
  optionALabel: string
  optionBLabel: string
}>()

const timepoints = computed(() => [
  { label: '1年後', a: props.optionATimeline.oneYear, b: props.optionBTimeline.oneYear },
  { label: '5年後', a: props.optionATimeline.fiveYears, b: props.optionBTimeline.fiveYears },
  { label: '10年後', a: props.optionATimeline.tenYears, b: props.optionBTimeline.tenYears },
  { label: '80歳の視点', a: props.optionATimeline.atEighty, b: props.optionBTimeline.atEighty },
])
</script>

<template>
  <div class="space-y-4">
    <div v-for="(tp, i) in timepoints" :key="i" class="relative">
      <!-- 時点ラベル -->
      <div class="flex items-center gap-3 mb-2">
        <div class="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        <span class="text-amber-400 font-semibold text-sm">{{ tp.label }}</span>
        <div class="flex-1 h-px bg-neutral-800" />
      </div>
      <!-- A/B の予測 -->
      <div class="grid grid-cols-2 gap-3 pl-5">
        <div class="bg-blue-950/40 border border-blue-900/50 rounded-lg px-3 py-2">
          <p class="text-xs text-blue-400 font-medium mb-1">{{ optionALabel }}</p>
          <p class="text-sm text-neutral-300">{{ tp.a }}</p>
        </div>
        <div class="bg-emerald-950/40 border border-emerald-900/50 rounded-lg px-3 py-2">
          <p class="text-xs text-emerald-400 font-medium mb-1">{{ optionBLabel }}</p>
          <p class="text-sm text-neutral-300">{{ tp.b }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
