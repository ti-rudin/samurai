<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-gray-200 dark:border-gray-600">
    <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Суммарные начисления исполнителям
      </h3>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Исполнитель
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Завершенных работ
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Сумма начислений
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <template v-for="executor in executorEarnings" :key="executor.id">
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <button
                    @click="toggleExecutor(executor.id)"
                    class="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg
                      :class="['w-4 h-4 transform transition-transform', expandedExecutors.has(executor.id) ? 'rotate-90' : '']"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ executor.name }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ executor.workCount }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(executor.earnings) }}
                </div>
              </td>

            </tr>

            <!-- Раскрывающаяся детальная информация -->
            <tr v-if="expandedExecutors.has(executor.id)" class="bg-gray-50 dark:bg-gray-700">
              <td colspan="3" class="px-6 py-4">
                <div class="text-sm">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-3">Детальная информация по работам:</h4>
                  <div class="space-y-2">
                    <div
                      v-for="detail in getExecutorDetails(executor.id)"
                      :key="`${detail.executorId}-${detail.orderId}-${detail.workId}`"
                      class="bg-white dark:bg-gray-600 p-3 rounded border border-gray-200 dark:border-gray-500"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <span class="font-medium text-gray-700 dark:text-gray-300">Заказ:</span>
                          <span class="ml-2 text-gray-900 dark:text-white">#{{ detail.orderId }}</span>
                          <span class="ml-2 text-gray-600 dark:text-gray-400">({{ detail.clientName }})</span>
                        </div>
                        <div>
                          <span class="font-medium text-gray-700 dark:text-gray-300">Работа:</span>
                          <span class="ml-2 text-gray-900 dark:text-white">{{ detail.workName }}</span>
                        </div>
                        <div>
                          <span class="font-medium text-gray-700 dark:text-gray-300">Стоимость:</span>
                          <span class="ml-2 text-gray-900 dark:text-white">{{ formatCurrency(detail.workCost) }}</span>
                          <span class="ml-2 text-green-600 dark:text-green-400">Начисление: {{ formatCurrency(detail.earnings) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Сообщение о пустом списке -->
    <div v-if="!executorEarnings || executorEarnings.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400">
      <div class="text-lg font-medium">Нет данных о начислениях</div>
      <div class="text-sm mt-2">За выбранный период нет завершенных работ с назначенными исполнителями</div>

      <!-- Дополнительная информация для отладки -->
      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Отладочная информация:</h4>
        <div class="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <div><strong>Выбранная неделя:</strong> {{ formatWeekRange(selectedWeek) }}</div>
          <div><strong>Найдено завершенных заказов:</strong> {{ allCompletedOrdersCount }}</div>
          <div><strong>Завершенных работ всего:</strong> {{ allCompletedWorksCount }}</div>
          <div v-if="lastCompletionDate" class="text-orange-600 dark:text-orange-400">
            <strong>Последняя дата завершения работы:</strong> {{ formatDate(lastCompletionDate) }}
          </div>
          <div v-if="suggestedWeek" class="mt-2">
            <strong>Рекомендуемая неделя:</strong>
            <button @click="$emit('set-week', suggestedWeek)"
              class="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
              Выбрать неделю {{ suggestedWeek }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExecutorEarningsTable',
  props: {
    executorEarnings: {
      type: Array,
      default: () => []
    },
    executorDetails: {
      type: Array,
      default: () => []
    },
    selectedWeek: {
      type: String,
      default: ''
    },
    allCompletedOrdersCount: {
      type: Number,
      default: 0
    },
    allCompletedWorksCount: {
      type: Number,
      default: 0
    },
    lastCompletionDate: {
      type: Date,
      default: null
    },
    suggestedWeek: {
      type: String,
      default: ''
    }
  },
  emits: ['set-week'],
  data() {
    return {
      expandedExecutors: new Set()
    }
  },
  methods: {
    toggleExecutor(executorId) {
      if (this.expandedExecutors.has(executorId)) {
        this.expandedExecutors.delete(executorId)
      } else {
        this.expandedExecutors.add(executorId)
      }
    },
    getExecutorDetails(executorId) {
      return this.executorDetails.filter(detail => detail.executorId === executorId)
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },
    formatWeekRange(weekString) {
      if (!weekString) return '-'
      const { monday, sunday } = this.getWeekDates(weekString)
      return `${monday.toLocaleDateString('ru-RU')} - ${sunday.toLocaleDateString('ru-RU')}`
    },
    getWeekDates(weekString) {
      const [year, week] = weekString.split('-W').map(Number)
      const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
      const dayOfWeek = simple.getUTCDay() || 7
      const monday = new Date(simple)
      monday.setUTCDate(simple.getUTCDate() - dayOfWeek + 1)
      const sunday = new Date(monday)
      sunday.setUTCDate(monday.getUTCDate() + 6)
      return { monday, sunday }
    },
    formatDate(date) {
      return date ? date.toLocaleDateString('ru-RU') : '-'
    }
  }
}
</script>
