<script setup lang="ts">
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps<{
  optionAAxes: Record<string, number>
  optionBAxes: Record<string, number>
  optionALabel: string
  optionBLabel: string
}>()

const labels = [
  '感情的後悔',
  '機会損失',
  '可逆性リスク',
  '成長可能性',
  '周囲への影響',
  '直感スコア',
]

const chartData = computed(() => ({
  labels,
  datasets: [
    {
      label: props.optionALabel,
      data: [
        props.optionAAxes.emotionalRegret,
        props.optionAAxes.opportunityLoss,
        100 - props.optionAAxes.reversibility, // 可逆性は低いほどリスク高
        props.optionAAxes.growthPotential,
        props.optionAAxes.impactOnOthers,
        props.optionAAxes.intuitionScore,
      ],
      backgroundColor: 'rgba(96, 165, 250, 0.2)',
      borderColor: 'rgba(96, 165, 250, 0.8)',
      pointBackgroundColor: 'rgba(96, 165, 250, 1)',
    },
    {
      label: props.optionBLabel,
      data: [
        props.optionBAxes.emotionalRegret,
        props.optionBAxes.opportunityLoss,
        100 - props.optionBAxes.reversibility,
        props.optionBAxes.growthPotential,
        props.optionBAxes.impactOnOthers,
        props.optionBAxes.intuitionScore,
      ],
      backgroundColor: 'rgba(52, 211, 153, 0.2)',
      borderColor: 'rgba(52, 211, 153, 0.8)',
      pointBackgroundColor: 'rgba(52, 211, 153, 1)',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { display: false },
      grid: { color: 'rgba(255,255,255,0.1)' },
      pointLabels: { color: '#a3a3a3', font: { size: 11 } },
      angleLines: { color: 'rgba(255,255,255,0.1)' },
    },
  },
  plugins: {
    legend: {
      labels: { color: '#e5e5e5', padding: 16 },
    },
  },
}
</script>

<template>
  <Radar :data="chartData" :options="chartOptions" />
</template>
