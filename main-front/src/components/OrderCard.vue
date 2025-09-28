<template>
  <div class="shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
    <!-- Карточка заказа -->
    <div class="p-4 sm:p-6 cursor-pointer" @click="$router.push({ name: 'order', params: { id: order.id } })">
      <!-- Мобильная версия -->
      <div class="block sm:hidden">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
              #{{ order.id }}
            </h3>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded">
                {{ formatDate(order.createdAt, true) }}
              </span>
              <span :class="getStatusColor(order.orderstatus)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                {{ getStatusText(order.orderstatus) }}
              </span>
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">Итого</div>
            <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
              {{ formatCurrency(getOrderMainPlanTotalCost(order)) }}
            </div>
          </div>
        </div>

        <p v-if="order.description" class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {{ order.description }}
        </p>

        <!-- Финансовая информация -->
        <div class="grid grid-cols-2 gap-4 text-sm mb-3">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <div class="min-w-0">
              <div class="text-gray-600 dark:text-gray-400 text-xs">Работы</div>
              <div class="font-semibold text-gray-900 dark:text-white truncate">{{ formatCurrency(getOrderMainPlanWorksCost(order)) }}</div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <div class="min-w-0">
              <div class="text-gray-600 dark:text-gray-400 text-xs">Запчасти</div>
              <div class="font-semibold text-gray-900 dark:text-white truncate">{{ formatCurrency(getOrderMainPlanPartsCost(order)) }}</div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span>Открыть</span>
        </div>
      </div>

      <!-- Десктопная версия -->
      <div class="hidden sm:block">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-4 mb-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                #{{ order.id }}
              </h3>
              <span class="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded-md">
                {{ formatDate(order.createdAt, true) }}
              </span>
              <span :class="getStatusColor(order.orderstatus)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getStatusText(order.orderstatus) }}
              </span>
            </div>
            <p v-if="order.description" class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {{ order.description }}
            </p>

            <!-- Финансовая информация -->
            <div class="flex items-center space-x-6 text-sm">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600 dark:text-gray-400">Работы:</span>
                <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(getOrderMainPlanWorksCost(order)) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600 dark:text-gray-400">Запчасти:</span>
                <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(getOrderMainPlanPartsCost(order)) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-end space-y-2">
            <div class="text-right">
              <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Итого основной план</div>
              <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
                {{ formatCurrency(getOrderMainPlanTotalCost(order)) }}
              </div>
            </div>

            <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
              <span>Открыть</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderCard',
  props: {
    order: {
      type: Object,
      required: true
    },
    isExpanded: {
      type: Boolean,
      default: false
    },
    formatDate: {
      type: Function,
      required: true
    },
    getStatusColor: {
      type: Function,
      required: true
    },
    getStatusText: {
      type: Function,
      required: true
    },
    getWorkStatusText: {
      type: Function,
      required: true
    },
    formatCurrency: {
      type: Function,
      required: true
    },
    getMainPlanWorks: {
      type: Function,
      required: true
    },
    getRecommendedWorks: {
      type: Function,
      required: true
    },
    getMainPlanParts: {
      type: Function,
      required: true
    },
    getRecommendedParts: {
      type: Function,
      required: true
    },
    getOrderMainPlanWorksCost: {
      type: Function,
      required: true
    },
    getOrderMainPlanPartsCost: {
      type: Function,
      required: true
    },
    getOrderMainPlanTotalCost: {
      type: Function,
      required: true
    },
    getOrderRecommendedWorksCost: {
      type: Function,
      required: true
    },
    getOrderRecommendedPartsCost: {
      type: Function,
      required: true
    },
    getOrderRecommendedTotalCost: {
      type: Function,
      required: true
    }
  },
  emits: ['toggle-expansion']
}
</script>
