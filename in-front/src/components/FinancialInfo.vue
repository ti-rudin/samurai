<template>
  <div class="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[120px] md:min-h-[140px]">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between h-full">
      <div class="flex items-center space-x-3 mb-3 md:mb-0">
        <div class="p-2 md:p-3 rounded-lg flex-shrink-0" :class="iconBgClass">
          <span class="text-xl md:text-2xl">{{ icon }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate">{{ title }}</h3>
          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{{ subtitle }}</p>
        </div>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0">
        <div class="text-lg md:text-2xl font-bold text-gray-900 dark:text-white break-all">{{ formattedValue }}</div>
        <div v-if="change !== undefined" class="text-xs md:text-sm mt-1" :class="changeClass">
          {{ change > 0 ? '+' : '' }}{{ change.toFixed(1) }}%
        </div>
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
      required: true
    },
    icon: {
      type: String,
      default: '💰'
    },
    subtitle: {
      type: String,
      default: ''
    },
    change: {
      type: Number,
      default: undefined
    },
    color: {
      type: String,
      default: 'blue'
    }
  },
  computed: {
    formattedValue() {
      if (typeof this.value === 'number') {
        if (this.title.toLowerCase().includes('задач')) {
          return this.value.toString() // Количество задач
        } else {
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(this.value)
        }
      }
      return this.value
    },
    iconBgClass() {
      const colorMap = {
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
        red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
      }
      return colorMap[this.color] || colorMap.blue
    },
    changeClass() {
      if (this.change > 0) return 'text-green-600 dark:text-green-400'
      if (this.change < 0) return 'text-red-600 dark:text-red-400'
      return 'text-gray-500 dark:text-gray-400'
    }
  }
}
</script>
