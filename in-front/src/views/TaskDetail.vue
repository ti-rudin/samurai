<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="text-center py-8">
      Загрузка данных...
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="text-center py-8 text-red-500">
      Ошибка загрузки: {{ error }}
    </div>

    <!-- Основной контент -->
    <template v-else-if="task">
      <!-- Заголовок -->
      <div class="mb-6">
        <div class="flex items-center space-x-4">
          <button @click="$router.go(-1)"
            class="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

        </div>
      </div>

      <!-- Наименование задачи -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {{ task.name || 'Без названия' }}
        </h2>
        <div class="flex items-center justify-between mb-4">
          <span :class="getTaskStatusColorClass(task.status)"
            class="px-3 py-1 rounded-full text-sm font-medium">
            {{ getTaskStatusText(task.status) }}
          </span>
          <div class="flex space-x-2">
            <button v-if="canTake" @click="takeTask"
              class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm">
              Взять в работу
            </button>
            <button v-if="canClose" @click="closeTask"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
              Завершить
            </button>
          </div>
        </div>
      </div>

      <!-- Информация о заказе -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Информация о заказе</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Заказ</p>
            <p class="font-medium text-gray-900 dark:text-white">#{{ task.orderId }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Автомобиль</p>
            <div class="flex items-center space-x-2">
              <p class="font-medium text-gray-900 dark:text-white">{{ task.carName }}</p>
              <button @click="copyToClipboard(task.carName)"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Копировать название автомобиля">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">VIN номер</p>
            <div class="flex items-center space-x-2">
              <p class="font-medium text-gray-900 dark:text-white font-mono">{{ task.carVin }}</p>
              <button @click="copyToClipboard(task.carVin)"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Копировать VIN номер">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Детали задачи -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Детали задачи</h2>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Название</p>
            <p class="text-gray-900 dark:text-white">{{ task.name || 'Без названия' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Описание</p>
            <p class="text-gray-900 dark:text-white">{{ task.description || 'Без описания' }}</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button @click="copyAIPrompt"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
            Скопировать промпт для ИИ
          </button>
        </div>
      </div>

      <!-- Финансовая информация -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">К начислению</h2>
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg border border-green-200 dark:border-gray-500">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{{ formatCurrency(task.earnings) }}</div>

          </div>
        </div>
      </div>

      <!-- Даты -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Даты</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Дата создания</p>
            <p class="text-gray-900 dark:text-white">{{ formatDate(task.createdAt) }}</p>
          </div>
          <div v-if="task.status === 'completed'">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Дата завершения</p>
            <p class="text-gray-900 dark:text-white">{{ formatDate(task.completedAt) }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Задача не найдена -->
    <div v-else class="text-center py-8">
      <div class="text-lg font-medium text-gray-500 dark:text-gray-400">Задача не найдена</div>
      <button @click="$router.go(-1)" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Вернуться назад
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'TaskDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const ordersStore = useOrdersStore()
    const { notifySuccess, notifyError } = useNotifications()

    const isLoading = ref(false)
    const error = ref(null)
    const task = ref(null)

    // Загрузка данных задачи
    const loadTask = async () => {
      try {
        isLoading.value = true
        error.value = null

        const taskId = route.params.id
        if (!taskId) {
          throw new Error('ID задачи не указан')
        }

        // Загружаем заказы, если они еще не загружены
        if (ordersStore.orders.length === 0) {
          await ordersStore.fetchOrders()
        }

        // Ищем задачу среди всех заказов
        const currentUserId = authStore.userId
        let foundTask = null

        ordersStore.orders.forEach(order => {
          if (order.works && order.works.length > 0) {
            order.works.forEach(work => {
              if (work.id == taskId) { // Используем == для сравнения string и number
                // Проверяем, является ли текущий пользователь исполнителем этой работы
                let isExecutor = false

                if (work.executor) {
                  if (Array.isArray(work.executor)) {
                    if (work.executor.length > 0) {
                      isExecutor = work.executor.some(exec => {
                        return exec.id === currentUserId
                      })
                    }
                  } else if (work.executor.id) {
                    isExecutor = work.executor.id === currentUserId
                  } else if (work.executor === currentUserId) {
                    isExecutor = true
                  }
                }

                if (isExecutor) {
                  // Расчет начислений для инженера
                  const workCost = work.cost || 0
                  const executorPercentage = work.executorPercentage || 0
                  const totalWorkEarnings = workCost * (executorPercentage / 100) // Общая сумма начислений для работы
                  let earnings = 0

                  // Если есть executorPays с индивидуальными процентами от общей суммы
                  if (work.executorPays && Array.isArray(work.executorPays) && work.executorPays.length > 0) {
                    const currentUserPay = work.executorPays.find(pay => pay.id === currentUserId)
                    if (currentUserPay && currentUserPay.percentage) {
                      earnings = totalWorkEarnings * (currentUserPay.percentage / 100)
                    } else {
                      // Если процент не найден, делим поровну между исполнителями
                      const totalExecutors = work.executorPays.length
                      earnings = totalWorkEarnings / totalExecutors
                    }
                  } else {
                    // Старый способ с executorPercentage
                    const totalExecutors = Array.isArray(work.executor) ? work.executor.length : 1
                    earnings = totalWorkEarnings / totalExecutors
                  }

                  // Используем правильное поле для даты завершения
                  const completedAt = work.completedAt || work.updatedAt

                  foundTask = {
                    id: work.id,
                    name: work.name,
                    description: work.description,
                    status: work.status_of_work,
                    cost: workCost,
                    earnings: earnings,
                    executorPercentage: executorPercentage,
                    createdAt: work.createdAt,
                    completedAt: completedAt,
                    orderId: order.id,
                    clientName: order.client?.name || 'Неизвестный клиент',
                    carName: `${order.car?.make || ''} ${order.car?.model || ''}`.trim() || 'Неизвестный автомобиль',
                    carVin: order.car?.vin || 'VIN не указан',
                    order: order
                  }
                }
              }
            })
          }
        })

        if (!foundTask) {
          throw new Error('Задача не найдена или у вас нет доступа к ней')
        }

        task.value = foundTask
      } catch (err) {
        console.error('Ошибка загрузки задачи:', err)
        error.value = err.message || 'Ошибка загрузки задачи'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      loadTask()
    })

    // Проверка возможности взять задачу в работу
    const canTake = computed(() => {
      return task.value && task.value.status === 'pending'
    })

    // Проверка возможности закрытия задачи
    const canClose = computed(() => {
      return task.value && task.value.status !== 'completed'
    })

    // Взятие задачи в работу
    const takeTask = async () => {
      if (!task.value || !canTake.value) return

      try {
        const updatedData = {
          status_of_work: 'in_progress',
          order: task.value.order.id
        }

        await ordersStore.updateWork(task.value.id, updatedData)

        // Обновляем локальные данные
        task.value.status = 'in_progress'

        // Показываем уведомление об успехе
        notifySuccess('Задача взята в работу', 'Работа успешно взята в работу')
      } catch (err) {
        console.error('Ошибка взятия задачи в работу:', err)
        notifyError('Ошибка', 'Не удалось взять задачу в работу: ' + err.message)
      }
    }

    // Закрытие задачи
    const closeTask = async () => {
      if (!task.value || !canClose.value) return

      try {
        const updatedData = {
          status_of_work: 'completed',
          order: task.value.order.id
        }

        await ordersStore.updateWork(task.value.id, updatedData)

        // Обновляем локальные данные
        task.value.status = 'completed'
        task.value.completedAt = new Date().toISOString()

        // Показываем уведомление об успехе
        notifySuccess('Задача завершена', 'Работа успешно завершена')
      } catch (err) {
        console.error('Ошибка завершения задачи:', err)
        notifyError('Ошибка', 'Не удалось завершить задачу: ' + err.message)
      }
    }

    // Копирование промпта для ИИ
    const copyAIPrompt = async () => {
      if (!task.value) return

      const prompt = `Как выполнить эту работу?

Название работы: ${task.value.name || 'Без названия'}
Описание: ${task.value.description || 'Без описания'}

Данные автомобиля:
- Марка и модель: ${task.value.carName}
- VIN номер: ${task.value.carVin}

Пожалуйста, предоставь подробную инструкцию по выполнению этой работы для данного автомобиля.`

      try {
        await navigator.clipboard.writeText(prompt)
        notifySuccess('Промпт скопирован', 'Промпт для ИИ успешно скопирован в буфер обмена')
      } catch (err) {
        console.error('Ошибка копирования промпта:', err)
        notifyError('Ошибка копирования', 'Не удалось скопировать промпт')
      }
    }

    // Копирование текста в буфер обмена
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        notifySuccess('Скопировано', 'Текст успешно скопирован в буфер обмена')
      } catch (err) {
        console.error('Ошибка копирования:', err)
        notifyError('Ошибка копирования', 'Не удалось скопировать текст')
      }
    }

    // Вспомогательные методы
    const getTaskStatusText = (status) => {
      const statusMap = {
        'pending': 'Ожидает',
        'in_progress': 'В работе',
        'completed': 'Завершена'
      }
      return statusMap[status] || status
    }

    const getTaskStatusColorClass = (status) => {
      const colorMap = {
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      }
      return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      isLoading,
      error,
      task,
      canTake,
      canClose,
      takeTask,
      closeTask,
      copyAIPrompt,
      copyToClipboard,
      getTaskStatusText,
      getTaskStatusColorClass,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
