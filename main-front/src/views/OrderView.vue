<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Кнопка назад -->
      <div class="mb-6">
        <button
          @click="$router.go(-1)"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Назад
        </button>
      </div>

      <!-- Заголовок заказа -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                Заказ #{{ order.id }} от {{ formatDate(order.createdAt, true) }}
              </h1>
              <p v-if="order.description" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {{ order.description }}
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <span :class="getStatusColor(order.orderstatus)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getStatusText(order.orderstatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Основной план -->
        <div v-if="getMainPlanWorks(order).length > 0 || getMainPlanParts(order).length > 0" class="border-b border-gray-200 dark:border-gray-700">
          <!-- Основные работы -->
          <div v-if="getMainPlanWorks(order).length > 0" class="px-6 py-4">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Основной план работ
            </h4>
            <div class="space-y-3">
              <div
                v-for="work in getMainPlanWorks(order)"
                :key="work.id"
                class="flex justify-between items-start p-4 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-all duration-200 group"
              >
                <div class="flex-1">
                  <div class="font-medium text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">
                    {{ work.name }}
                  </div>
                  <div v-if="work.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1" v-html="work.description"></div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                    <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span class="font-semibold text-blue-700 dark:text-blue-300">Статус: {{ getWorkStatusText(work.status_of_work) }}</span>
                  </div>
                </div>
                <div v-if="work.cost" class="text-sm font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg">
                  {{ work.cost }} ₽
                </div>
              </div>
            </div>
          </div>

          <!-- Основные запчасти -->
          <div v-if="getMainPlanParts(order).length > 0" class="px-6 py-4">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Основной план запчастей
            </h4>
            <div class="space-y-2">
              <div
                v-for="part in getMainPlanParts(order)"
                :key="part.id"
                class="p-4 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-all duration-200 group"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">№ {{ part.partNumber || part.sku || part.article || part.code || part.number || part.id }}</div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">{{ part.name }}</span>
                  </div>
                  <span class="text-sm font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md">
                    {{ formatCurrency((part.price || 0) * (part.quantity || 1)) }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <span class="flex items-center">
                    <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {{ part.price || 0 }} ₽ × {{ part.quantity || 1 }} шт.
                  </span>
                  <span class="font-medium">Итого: {{ formatCurrency((part.price || 0) * (part.quantity || 1)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Рекомендации -->
        <div v-if="getRecommendedWorks(order).length > 0 || getRecommendedParts(order).length > 0" class="border-b border-gray-200 dark:border-gray-700">
          <!-- Рекомендованные работы -->
          <div v-if="getRecommendedWorks(order).length > 0" class="px-6 py-4">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Рекомендованные работы
            </h4>
            <div class="space-y-3">
              <div
                v-for="work in getRecommendedWorks(order)"
                :key="work.id"
                class="flex justify-between items-start p-4 border border-amber-200 dark:border-amber-800 rounded-xl hover:shadow-md transition-all duration-200 group"
              >
                <div class="flex-1">
                  <div class="font-medium text-gray-900 dark:text-white group-hover:text-amber-900 dark:group-hover:text-amber-200 transition-colors">
                    {{ work.name }}
                  </div>
                  <div v-if="work.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1" v-html="work.description"></div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                    <span class="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    <span class="font-semibold text-amber-700 dark:text-amber-300">Статус: {{ getWorkStatusText(work.status_of_work) }}</span>
                  </div>
                </div>
                <div v-if="work.cost" class="text-sm font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg">
                  {{ work.cost }} ₽
                </div>
              </div>
            </div>
          </div>

          <!-- Рекомендованные запчасти -->
          <div v-if="getRecommendedParts(order).length > 0" class="px-6 py-4">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Рекомендованные запчасти
            </h4>
            <div class="space-y-2">
              <div
                v-for="part in getRecommendedParts(order)"
                :key="part.id"
                class="p-4 border border-amber-200 dark:border-amber-800 rounded-xl hover:shadow-md transition-all duration-200 group"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">№ {{ part.partNumber || part.sku || part.article || part.code || part.number || part.id }}</div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-900 dark:group-hover:text-amber-200 transition-colors">{{ part.name }}</span>
                  </div>
                  <span class="text-sm font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md">
                    {{ formatCurrency((part.price || 0) * (part.quantity || 1)) }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <span class="flex items-center">
                    <span class="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    {{ part.price || 0 }} ₽ × {{ part.quantity || 1 }} шт.
                  </span>
                  <span class="font-medium">Итого: {{ formatCurrency((part.price || 0) * (part.quantity || 1)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Финансовая сводка заказа -->
        <div class="px-6 py-6 border-t border-indigo-100 dark:border-indigo-800">
          <h4 class="text-base font-semibold text-indigo-900 dark:text-indigo-200 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            Финансовая сводка
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Основной план -->
            <div class="p-5 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 hover:shadow-md transition-shadow duration-200">
              <h5 class="text-base font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Основной план
              </h5>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Работы:</span>
                  <span class="font-semibold text-blue-700 dark:text-blue-300">{{ formatCurrency(getOrderMainPlanWorksCost(order)) }}</span>
                </div>
                <div class="flex justify-between items-center py-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Запчасти:</span>
                  <span class="font-semibold text-blue-700 dark:text-blue-300">{{ formatCurrency(getOrderMainPlanPartsCost(order)) }}</span>
                </div>
                <div class="border-t border-blue-200 dark:border-blue-700 pt-3 mt-3">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-blue-900 dark:text-blue-200">Итого:</span>
                    <span class="text-base font-bold text-blue-900 dark:text-blue-200">{{ formatCurrency(getOrderMainPlanTotalCost(order)) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Рекомендации -->
            <div class="p-5 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800 hover:shadow-md transition-shadow duration-200">
              <h5 class="text-base font-semibold text-amber-900 dark:text-amber-200 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Рекомендации
              </h5>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Работы:</span>
                  <span class="font-semibold text-amber-700 dark:text-amber-300">{{ formatCurrency(getOrderRecommendedWorksCost(order)) }}</span>
                </div>
                <div class="flex justify-between items-center py-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Запчасти:</span>
                  <span class="font-semibold text-amber-700 dark:text-amber-300">{{ formatCurrency(getOrderRecommendedPartsCost(order)) }}</span>
                </div>
                <div class="border-t border-amber-200 dark:border-amber-700 pt-3 mt-3">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-amber-900 dark:text-amber-200">Итого:</span>
                    <span class="text-base font-bold text-amber-900 dark:text-amber-200">{{ formatCurrency(getOrderRecommendedTotalCost(order)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Примечания -->
        <div v-if="order.notes" class="px-6 py-5 border-t border-gray-200 dark:border-gray-600">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            Примечания
          </h4>
          <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ order.notes }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useOrderFormatting } from '@/composables/useOrderFormatting'

export default {
  name: 'OrderView',
  setup() {
    const route = useRoute()
    const clientStore = useClientStore()
    const {
      formatDate,
      getStatusColor,
      getStatusText,
      getWorkStatusText,
      formatCurrency,
      getMainPlanWorks,
      getRecommendedWorks,
      getMainPlanParts,
      getRecommendedParts,
      getOrderMainPlanWorksCost,
      getOrderMainPlanPartsCost,
      getOrderMainPlanTotalCost,
      getOrderRecommendedWorksCost,
      getOrderRecommendedPartsCost,
      getOrderRecommendedTotalCost
    } = useOrderFormatting()

    return {
      route,
      clientStore,
      formatDate,
      getStatusColor,
      getStatusText,
      getWorkStatusText,
      formatCurrency,
      getMainPlanWorks,
      getRecommendedWorks,
      getMainPlanParts,
      getRecommendedParts,
      getOrderMainPlanWorksCost,
      getOrderMainPlanPartsCost,
      getOrderMainPlanTotalCost,
      getOrderRecommendedWorksCost,
      getOrderRecommendedPartsCost,
      getOrderRecommendedTotalCost
    }
  },
  computed: {
    order() {
      return this.clientStore.getOrderById(parseInt(this.route.params.id))
    }
  },
  mounted() {
    if (!this.order) {
      // Если заказ не найден, перенаправляем на dashboard
      this.$router.push({ name: 'dashboard' })
    }
  }
}
</script>
