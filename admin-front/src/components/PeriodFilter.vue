<template>
  <div class="space-y-4">
    <!-- Карточка фильтра -->
    <div class="bg-white dark:bg-transparent p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="space-y-5">
        <!-- Быстрый выбор -->
        <div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Быстрый выбор
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="period in predefinedPeriods"
              :key="period.key"
              @click="$emit('period-selected', period)"
              :class="[
                'px-4 h-10 inline-flex items-center rounded-full border text-sm transition-all',
                selectedPeriod?.key === period.key
                  ? 'bg-blue-600 border-blue-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <div class="h-px bg-gray-200 dark:bg-gray-700"></div>

        <!-- Произвольный период -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Произвольный период
          </label>

          <div class="flex flex-col md:flex-row gap-3 md:items-center">
            <div class="flex items-center gap-3 flex-1">
              <input
                :value="customStartDate"
                type="date"
                class="w-full md:w-56 h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                @input="$emit('update:customStartDate', $event.target.value)"
                @change="$emit('custom-date-change')"
              />
              <span class="text-gray-500">—</span>
              <input
                :value="customEndDate"
                type="date"
                class="w-full md:w-56 h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                @input="$emit('update:customEndDate', $event.target.value)"
                @change="$emit('custom-date-change')"
              />
            </div>

            <button
              @click="$emit('load-data')"
              :disabled="!canLoadData"
              class="h-12 px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg ring-1 ring-emerald-400/30 hover:from-emerald-700 hover:to-green-700 hover:ring-emerald-400/50 active:from-emerald-800 active:to-green-800 disabled:opacity-60 disabled:cursor-not-allowed border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M12 16a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L11 12.59V4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-.7.29z"></path>
                <path d="M5 18a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H6a1 1 0 0 0-1 1z"></path>
              </svg>
              <span>Загрузить</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Отдельный блок выбранного периода -->
    <div class="bg-gray-50 dark:bg-transparent p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
        Выбранный период
      </div>
      <div class="text-base font-semibold text-gray-900 dark:text-white">
        {{ formatPeriodRange(selectedPeriod) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PeriodFilter',
  props: {
    predefinedPeriods: {
      type: Array,
      required: true
    },
    selectedPeriod: {
      type: Object,
      default: null
    },
    customStartDate: {
      type: String,
      default: ''
    },
    customEndDate: {
      type: String,
      default: ''
    },
    canLoadData: {
      type: Boolean,
      default: false
    }
  },
  emits: ['period-selected', 'custom-date-change', 'load-data', 'update:customStartDate', 'update:customEndDate'],
  methods: {
    formatPeriodRange(period) {
      if (!period) return '-'

      let dates
      if (period.key === 'custom') {
        dates = {
          monday: new Date(this.customStartDate),
          sunday: new Date(this.customEndDate)
        }
      } else {
        dates = period.getDates()
      }

      return `${dates.monday.toLocaleDateString('ru-RU')} - ${dates.sunday.toLocaleDateString('ru-RU')}`
    }
  }
}
</script>
