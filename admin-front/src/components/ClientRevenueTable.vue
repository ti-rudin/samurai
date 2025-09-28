<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-gray-200 dark:border-gray-600 mb-8">
    <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Выручка по клиентам
      </h3>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Клиент
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Завершенных заказов
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Сумма выручки
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Доля в общей выручке
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="clientRevenue in clientRevenues" :key="clientRevenue.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ clientRevenue.name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ clientRevenue.phone || 'Телефон не указан' }}
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ clientRevenue.orderCount }}
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(clientRevenue.revenue) }}
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ clientRevenue.percentage }}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Сообщение о пустом списке -->
    <div v-if="!clientRevenues || clientRevenues.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400">
      <div class="text-lg font-medium">Нет данных о выручке</div>
      <div class="text-sm mt-2">За выбранный период нет завершенных работ</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientRevenueTable',
  props: {
    clientRevenues: {
      type: Array,
      default: () => []
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
