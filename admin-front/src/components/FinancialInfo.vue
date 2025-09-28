<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <div class="text-center">
      <div class="text-3xl mb-2">{{ icon }}</div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(value) }}</div>
      <div class="text-sm text-gray-600 dark:text-gray-400">{{ title }}</div>
      <div v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinancialInfo',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: '📊'
    },
    color: {
      type: String,
      default: 'blue',
      validator: (value) => ['emerald', 'purple', 'orange', 'blue', 'red', 'green'].includes(value)
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }
  }
}
</script>

<style scoped>
/* Можно добавить специфические стили для разных цветов */
</style>
