<template>
  <div class="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">


    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="text-center py-8">
      Загрузка данных...
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="text-center py-8 text-red-500">
      Ошибка загрузки: {{ error }}
    </div>

    <!-- Основной контент -->
    <template v-else>


      <!-- Текущие задачи -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Текущие задачи</h2>
        <div class="grid gap-4">
          <div v-for="task in currentTasks" :key="task.id"
            @click="goToTaskDetail(task)"
            class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer">
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {{ task.name || 'Без названия' }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Заказ #{{ task.orderId }} - {{ task.clientName }} ({{ task.carName }})
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ task.description || 'Без описания' }}
                </p>
                <!-- Сумма к начислению для текущих задач -->
                <div class="mt-3">
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-3 rounded-lg border border-blue-200 dark:border-gray-600">
                    <div class="flex items-center justify-between">
                      <div class="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        К начислению
                      </div>
                      <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {{ formatCurrency(task.earnings) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span :class="getTaskStatusColorClass(task.status)"
                  class="px-2 py-1 rounded text-xs font-medium">
                  {{ getTaskStatusText(task.status) }}
                </span>
              </div>
            </div>

          </div>

          <!-- Сообщение о пустом списке -->
          <div v-if="currentTasks.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <div class="text-lg font-medium">Нет текущих задач</div>
            <div class="text-sm mt-2">Все задачи выполнены или ожидают назначения</div>
          </div>
        </div>
      </div>

      <!-- Фильтр по периодам -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Фильтр завершенных задач</h2>
        <PeriodFilter
          :predefined-periods="predefinedPeriods"
          :selected-period="selectedPeriod"
          v-model:custom-start-date="customStartDate"
          v-model:custom-end-date="customEndDate"
          :can-load-data="canLoadData"
          @period-selected="setPeriod"
          @custom-date-change="onCustomDateChange"
          @load-data="applyFilter"
        />
      </div>

      <!-- Финансовый обзор -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Финансовый обзор</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <FinancialInfo
            title="Общие начисления"
            :value="currentPeriodMetrics.totalEarnings"
            icon="💰"
            color="emerald"
            :change="periodComparison.earningsChange"
            subtitle="за выбранный период"
          />
          <FinancialInfo
            title="Выполненных задач"
            :value="currentPeriodMetrics.totalTasks"
            icon="✅"
            color="blue"
            :change="periodComparison.tasksChange"
            subtitle="за выбранный период"
          />
        </div>
      </div>

      <!-- Завершенные задачи -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Завершенные задачи</h2>
        <div class="grid gap-4">
          <div v-for="task in completedTasks" :key="task.id"
            @click="goToTaskDetail(task)"
            class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-green-300 dark:hover:border-green-500 transition-all cursor-pointer">
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {{ task.name || 'Без названия' }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Заказ #{{ task.orderId }} - {{ task.clientName }} ({{ task.carName }})
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ task.description || 'Без описания' }}
                </p>
              </div>
              <div class="flex flex-col items-end">
                <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Завершена
                </span>
              </div>
            </div>
            <!-- Финансовая информация для завершенных задач -->
            <div v-if="task.status === 'completed'" class="mt-3">
              <TaskFinancialDetails :task="task" />
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Завершена: {{ formatDate(task.completedAt) }}</span>
            </div>
          </div>

          <!-- Сообщение о пустом списке -->
          <div v-if="completedTasks.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <div class="text-lg font-medium">Нет завершенных задач</div>
            <div class="text-sm mt-2">Выполните первую задачу для отображения здесь</div>
          </div>
        </div>
      </div>
    </template>


  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'
import { usePeriodFilter } from '../composables/usePeriodFilter'
import { useEngineerFinance } from '../composables/useEngineerFinance'
import PeriodFilter from '../components/PeriodFilter.vue'
import FinancialInfo from '../components/FinancialInfo.vue'
import TaskFinancialDetails from '../components/TaskFinancialDetails.vue'

export default {
  name: 'Executor',
  components: {
    PeriodFilter,
    FinancialInfo,
    TaskFinancialDetails
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const ordersStore = useOrdersStore()

    // Используем composable для фильтрации по периодам
    const {
      selectedPeriod,
      customStartDate,
      customEndDate,
      predefinedPeriods,
      canLoadData,
      setPeriod,
      onCustomDateChange,
      filterTasksByPeriod
    } = usePeriodFilter()

    // Используем composable для финансовых расчетов
    const {
      financialMetrics: allTimeMetrics,
      getFinancialMetricsByPeriod,
      getPeriodComparison
    } = useEngineerFinance()

    const isLoading = ref(false)
    const error = ref(null)

    // Загрузка данных
    const loadData = async () => {
      try {
        isLoading.value = true
        error.value = null
        await ordersStore.fetchOrders()
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        error.value = err.message || 'Ошибка загрузки данных'
      } finally {
        isLoading.value = false
      }
    }

    // Установка фильтра по умолчанию на текущую неделю
    const setDefaultFilter = () => {
      const currentWeekPeriod = predefinedPeriods.value.find(p => p.key === 'current-week')
      if (currentWeekPeriod && !selectedPeriod.value) {
        setPeriod(currentWeekPeriod)
      }
    }

    onMounted(() => {
      loadData()
      setDefaultFilter()
    })

    // Получение задач текущего исполнителя
    const myTasks = computed(() => {
      const currentUserId = authStore.userId
      const allTasks = []

      ordersStore.orders.forEach(order => {
        if (order.works && order.works.length > 0) {
          order.works.forEach(work => {
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

              allTasks.push({
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
                order: order
              })
            }
          })
        }
      })
      return allTasks
    })

    // Текущие задачи (ожидают или в работе)
    const currentTasks = computed(() => {
      return myTasks.value.filter(task =>
        task.status === 'pending' || task.status === 'in_progress'
      )
    })

    // Все завершенные задачи
    const allCompletedTasks = computed(() => {
      return myTasks.value.filter(task => task.status === 'completed')
    })

    // Завершенные задачи с фильтрацией по периоду
    const completedTasks = computed(() => {
      if (!selectedPeriod.value) {
        return allCompletedTasks.value
      }
      return filterTasksByPeriod(allCompletedTasks.value)
    })

    // Финансовые метрики для текущего периода
    const currentPeriodMetrics = computed(() => {
      return getFinancialMetricsByPeriod(selectedPeriod.value)
    })

    // Сравнение с предыдущим периодом
    const periodComparison = computed(() => {
      if (!selectedPeriod.value) return { earningsChange: 0, tasksChange: 0 }

      let previousPeriod = null

      if (selectedPeriod.value.key === 'current-week') {
        previousPeriod = predefinedPeriods.value.find(p => p.key === 'last-week')
      } else if (selectedPeriod.value.key === 'current-month') {
        // Для месяца создаем предыдущий месяц
        previousPeriod = {
          key: 'previous-month',
          label: 'Прошлый месяц',
          getDates: () => {
            const now = new Date()
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const end = new Date(now.getFullYear(), now.getMonth(), 0)
            return { monday: start, sunday: end }
          }
        }
      }

      if (previousPeriod) {
        return getPeriodComparison(selectedPeriod.value, previousPeriod)
      }

      return { earningsChange: 0, tasksChange: 0 }
    })



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
        year: 'numeric'
      })
    }

    // Метод для перехода на страницу задачи
    const goToTaskDetail = (task) => {
      router.push({ name: 'task-detail', params: { id: task.id } })
    }

    // Метод для применения фильтра (для произвольного периода)
    const applyFilter = () => {
      // Фильтр применяется автоматически через computed свойство completedTasks
    }

    return {
      // Переменные из usePeriodFilter
      selectedPeriod,
      customStartDate,
      customEndDate,
      predefinedPeriods,
      canLoadData,
      setPeriod,
      onCustomDateChange,
      applyFilter,

      // Финансовые метрики
      currentPeriodMetrics,
      periodComparison,
      allTimeMetrics,

      // Остальные переменные
      isLoading,
      error,
      currentTasks,
      completedTasks,
      goToTaskDetail,
      getTaskStatusText,
      getTaskStatusColorClass,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
