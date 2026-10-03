<script setup lang="ts">
defineProps<{ show: boolean }>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-neutral-950/90 flex flex-col items-center justify-center z-50">
      <div class="relative mb-8">
        <div class="w-16 h-16 border-4 border-neutral-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
      <p class="text-amber-400 font-semibold text-lg mb-2">80歳の視点から分析中...</p>
      <p class="text-neutral-500 text-sm">後悔最小化フレームワークを適用しています</p>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
