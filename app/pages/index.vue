<script setup lang="ts">
import { useDecisionAnalysis } from '~/composables/useDecisionAnalysis'

useHead({ title: 'Regret.less — この決断、後悔する？' })

const { analyze, isLoading, errorMessage, reset } = useDecisionAnalysis()
const router = useRouter()

const form = reactive({
  decision: '',
  optionA: '',
  optionB: '',
  age: 30,
})

const errors = reactive({
  decision: '',
  optionA: '',
  optionB: '',
  age: '',
})

function validate(): boolean {
  errors.decision = form.decision.trim() ? '' : '決断の内容を入力してください'
  errors.optionA = form.optionA.trim() ? '' : '選択肢Aを入力してください'
  errors.optionB = form.optionB.trim() ? '' : '選択肢Bを入力してください'
  errors.age = form.age >= 18 && form.age <= 79 ? '' : '18〜79歳の間で入力してください'
  return !Object.values(errors).some(Boolean)
}

async function onSubmit() {
  if (!validate()) return
  reset()
  const success = await analyze({ ...form })
  if (success) router.push('/result')
}

const examples = [
  { decision: '転職するかどうか', optionA: '今の会社に残る', optionB: 'スタートアップに転職する' },
  { decision: '独立・起業するかどうか', optionA: '会社員を続ける', optionB: 'フリーランスとして独立する' },
  { decision: '海外移住するかどうか', optionA: '日本に留まる', optionB: '海外に移住する' },
]

function fillExample(ex: typeof examples[0]) {
  form.decision = ex.decision
  form.optionA = ex.optionA
  form.optionB = ex.optionB
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-16">
    <!-- ヘッダー -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-amber-400 mb-3">Regret.less</h1>
      <p class="text-neutral-400 text-lg">80歳の自分から見たとき、どちらの選択を後悔する？</p>
      <p class="text-neutral-600 text-sm mt-2">Jeff Bezosの後悔最小化フレームワークをAIで可視化</p>
    </div>

    <!-- フォーム -->
    <form class="space-y-6" @submit.prevent="onSubmit">
      <!-- 決断の内容 -->
      <div>
        <label class="block text-sm font-medium text-neutral-300 mb-1">
          あなたが迷っている決断
        </label>
        <input
          v-model="form.decision"
          type="text"
          placeholder="例：転職するかどうか"
          class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <p v-if="errors.decision" class="text-red-400 text-sm mt-1">{{ errors.decision }}</p>
      </div>

      <!-- 2択 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-neutral-300 mb-1">
            <span class="text-blue-400">選択肢 A</span>
          </label>
          <input
            v-model="form.optionA"
            type="text"
            placeholder="例：今の会社に残る"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <p v-if="errors.optionA" class="text-red-400 text-sm mt-1">{{ errors.optionA }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-300 mb-1">
            <span class="text-emerald-400">選択肢 B</span>
          </label>
          <input
            v-model="form.optionB"
            type="text"
            placeholder="例：スタートアップへ転職"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <p v-if="errors.optionB" class="text-red-400 text-sm mt-1">{{ errors.optionB }}</p>
        </div>
      </div>

      <!-- 現在の年齢 -->
      <div>
        <label class="block text-sm font-medium text-neutral-300 mb-1">
          現在の年齢: <span class="text-amber-400 font-bold">{{ form.age }}歳</span>
        </label>
        <input
          v-model.number="form.age"
          type="range"
          min="18"
          max="79"
          class="w-full accent-amber-500"
        />
        <div class="flex justify-between text-xs text-neutral-600 mt-1">
          <span>18歳</span>
          <span>79歳</span>
        </div>
        <p v-if="errors.age" class="text-red-400 text-sm mt-1">{{ errors.age }}</p>
      </div>

      <!-- エラー -->
      <p v-if="errorMessage" class="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
        {{ errorMessage }}
      </p>

      <!-- 送信ボタン -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 disabled:cursor-not-allowed text-neutral-950 font-bold py-4 rounded-lg text-lg transition-colors"
      >
        <span v-if="isLoading">80歳の視点から分析中...</span>
        <span v-else>後悔リスクを分析する →</span>
      </button>
    </form>

    <!-- サンプル -->
    <div class="mt-10">
      <p class="text-neutral-600 text-sm mb-3">サンプルで試す：</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="ex in examples"
          :key="ex.decision"
          class="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-3 py-1.5 rounded-full transition-colors"
          @click="fillExample(ex)"
        >
          {{ ex.decision }}
        </button>
      </div>
    </div>
  </div>
</template>
