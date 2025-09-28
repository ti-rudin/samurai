<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          САМУРАЙ Автоклуб Тверь
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Заказ-наряд
        </p>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Загрузка заказа...</span>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 dark:text-red-400 text-lg">
          {{ error }}
        </div>
        <button
          @click="retry"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>

      <!-- Заказ -->
      <div v-else-if="order" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <!-- Заголовок заказа -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Заказ #{{ order.id }}
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                от {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="text-right">
              <span :class="getStatusColor(order.orderstatus)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                {{ getStatusText(order.orderstatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Информация о клиенте и автомобиле -->
        <div v-if="order.client || order.car" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="order.client">
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">Клиент</h4>
              <p class="text-gray-600 dark:text-gray-400">{{ order.client.name }}</p>
              <p v-if="order.client.phone" class="text-gray-600 dark:text-gray-400">{{ order.client.phone }}</p>
              <p v-if="order.client.email" class="text-gray-600 dark:text-gray-400">{{ order.client.email }}</p>
            </div>
            <div v-if="order.car">
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">Автомобиль</h4>
              <p class="text-gray-600 dark:text-gray-400">
                {{ order.car.brand }} {{ order.car.model }}
                <span v-if="order.car.year">({{ order.car.year }})</span>
              </p>
              <p v-if="order.car.vin" class="text-gray-600 dark:text-gray-400">VIN: {{ order.car.vin }}</p>
              <p v-if="order.car.licensePlate" class="text-gray-600 dark:text-gray-400">Гос. номер: {{ order.car.licensePlate }}</p>
            </div>
          </div>
        </div>



        <!-- Основные работы -->
        <div v-if="mainWorks.length > 0" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Работы</h3>
          <div class="space-y-3">
            <div v-for="work in mainWorks" :key="work.id" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ work.name }}</h4>
                  <p v-if="work.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1" v-html="work.description"></p>
                </div>
                <div class="text-right ml-4">
                  <span class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(work.cost) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Основные запчасти -->
        <div v-if="mainParts.length > 0" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Запчасти</h3>
          <div class="space-y-3">
            <div v-for="part in mainParts" :key="part.id" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    № {{ part.number || part.article || part.sku || part.id }}
                  </div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ part.name }}</h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ formatCurrency(part.price) }} × {{ part.quantity || 1 }} шт.
                  </div>
                </div>
                <div class="text-right ml-4">
                  <span class="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {{ formatCurrency((part.price || 0) * (part.quantity || 1)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Рекомендованные работы -->
        <div v-if="recommendedWorks.length > 0" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4">Рекомендованные работы</h3>
          <div class="space-y-3">
            <div v-for="work in recommendedWorks" :key="work.id" class="border border-amber-200 dark:border-amber-600 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ work.name }}</h4>
                  <p v-if="work.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1" v-html="work.description"></p>
                </div>
                <div class="text-right ml-4">
                  <span class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ formatCurrency(work.cost) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Рекомендованные запчасти -->
        <div v-if="recommendedParts.length > 0" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4">Рекомендованные запчасти</h3>
          <div class="space-y-3">
            <div v-for="part in recommendedParts" :key="part.id" class="border border-amber-200 dark:border-amber-600 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    № {{ part.number || part.article || part.sku || part.id }}
                  </div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ part.name }}</h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ formatCurrency(part.price) }} × {{ part.quantity || 1 }} шт.
                  </div>
                </div>
                <div class="text-right ml-4">
                  <span class="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {{ formatCurrency((part.price || 0) * (part.quantity || 1)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Итого -->
        <div class="px-6 py-6 bg-gray-50 dark:bg-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Основной план</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Работы:</span>
                  <span class="font-medium">{{ formatCurrency(mainWorksTotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Запчасти:</span>
                  <span class="font-medium">{{ formatCurrency(mainPartsTotal) }}</span>
                </div>
                <div class="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div class="flex justify-between font-semibold text-lg">
                    <span>Итого:</span>
                    <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(mainTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="recommendedWorksTotal > 0 || recommendedPartsTotal > 0">
              <h4 class="font-semibold text-amber-900 dark:text-amber-200 mb-3">Рекомендации</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Работы:</span>
                  <span class="font-medium">{{ formatCurrency(recommendedWorksTotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Запчасти:</span>
                  <span class="font-medium">{{ formatCurrency(recommendedPartsTotal) }}</span>
                </div>
                <div class="border-t border-amber-300 dark:border-amber-600 pt-2 mt-2">
                  <div class="flex justify-between font-semibold text-lg">
                    <span>Итого:</span>
                    <span class="text-amber-600 dark:text-amber-400">{{ formatCurrency(recommendedTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Примечания -->
        <div v-if="order.notes" class="px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Примечания</h3>
          <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ order.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/strapi.js'
import { verifyShareToken } from '../utils/shareUtils.js'
import config from '../config.js'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const order = ref(null)

const token = computed(() => route.params.token)

// Вычисляемые свойства для фильтрации работ и запчастей
const mainWorks = computed(() => {
  if (!order.value?.works) return []
  return order.value.works.filter(work => !work.isRecomended)
})

const recommendedWorks = computed(() => {
  if (!order.value?.works) return []
  return order.value.works.filter(work => work.isRecomended)
})

const mainParts = computed(() => {
  if (!order.value?.parts) return []
  return order.value.parts.filter(part => !part.isRecomended)
})

const recommendedParts = computed(() => {
  if (!order.value?.parts) return []
  return order.value.parts.filter(part => part.isRecomended)
})

// Расчеты сумм
const mainWorksTotal = computed(() => {
  return mainWorks.value.reduce((sum, work) => sum + (parseFloat(work.cost) || 0), 0)
})

const mainPartsTotal = computed(() => {
  return mainParts.value.reduce((sum, part) => sum + ((parseFloat(part.price) || 0) * (parseFloat(part.quantity) || 1)), 0)
})

const mainTotal = computed(() => mainWorksTotal.value + mainPartsTotal.value)

const recommendedWorksTotal = computed(() => {
  return recommendedWorks.value.reduce((sum, work) => sum + (parseFloat(work.cost) || 0), 0)
})

const recommendedPartsTotal = computed(() => {
  return recommendedParts.value.reduce((sum, part) => sum + ((parseFloat(part.price) || 0) * (parseFloat(part.quantity) || 1)), 0)
})

const recommendedTotal = computed(() => recommendedWorksTotal.value + recommendedPartsTotal.value)

// Функции форматирования
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 ₽'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const getStatusColor = (status) => {
  const colors = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return colors[status] || colors.new
}

const getStatusText = (status) => {
  const texts = {
    new: 'Новый',
    in_progress: 'В работе',
    suspended: 'Приостановлен',
    completed: 'Завершен',
    cancelled: 'Отменен',
    deleted: 'Удален'
  }
  return texts[status] || 'Новый'
}

// Загрузка данных заказа
const loadOrder = async () => {
  try {
    loading.value = true
    error.value = ''

    // Проверяем токен
    const orderId = await verifyShareToken(token.value, config.SHARE_SALT)

    if (!orderId) {
      throw new Error('Недействительная ссылка')
    }

    // Загружаем данные заказа
    const response = await api.get(`/orders/${orderId}`)
    order.value = response.data.data

  } catch (err) {
    console.error('Ошибка загрузки заказа:', err)
    if (err.response?.status === 404) {
      error.value = 'Заказ не найден'
    } else if (err.response?.status === 403) {
      error.value = 'Доступ к заказу запрещен'
    } else {
      error.value = 'Ошибка загрузки заказа'
    }
  } finally {
    loading.value = false
  }
}

const retry = () => {
  loadOrder()
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
/* Дополнительные стили для мобильной адаптивности */
@media (max-width: 640px) {
  .max-w-4xl {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}
</style>
