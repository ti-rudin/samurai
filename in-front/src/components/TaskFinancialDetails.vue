<template>
  <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-3 md:p-4 rounded-lg border border-green-200 dark:border-gray-600">
    <div class="flex items-center justify-between">
      <div class="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
        К начислению
      </div>
      <div class="text-lg md:text-xl font-bold text-green-600 dark:text-green-400 break-all">
        {{ formatCurrency(task.earnings) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskFinancialDetails',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    }
  }
}
</script>
