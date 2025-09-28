<template>
  <div class="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-down">
        Панель исполнителя
      </h1>
      <p class="mb-6 text-gray-600 dark:text-gray-300">Управление вашими задачами и отчетами</p>
    </div>

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
            class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
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
              <div class="flex flex-col items-end space-y-2">
                <span :class="getTaskStatusColorClass(task.status)"
                  class="px-2 py-1 rounded text-xs font-medium">
                  {{ getTaskStatusText(task.status) }}
                </span>
                <button @click="openTaskModal(task)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                  Редактировать
                </button>
              </div>
            </div>
            <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Стоимость: {{ formatCurrency(task.cost) }}</span>
              <span>Создано: {{ formatDate(task.createdAt) }}</span>
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

      <!-- Завершенные задачи -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Завершенные задачи</h2>
        <div class="grid gap-4">
          <div v-for="task in completedTasks" :key="task.id"
            class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
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
              <div class="flex flex-col items-end space-y-2">
                <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Завершена
                </span>
                <button @click="openTaskModal(task)"
                  class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
                  Просмотр
                </button>
              </div>
            </div>
            <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Стоимость: {{ formatCurrency(task.cost) }}</span>
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

    <!-- Модальное окно редактирования задачи -->
    <div v-if="showTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Заголовок -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ selectedTask?.id ? 'Редактирование задачи' : 'Просмотр задачи' }}
          </h3>
          <button @click="closeTaskModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Форма -->
        <form v-if="selectedTask" @submit.prevent="saveTask" class="space-y-4">
          <!-- Название -->
          <div>
            <label for="task-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название задачи *
            </label>
            <input
              id="task-name"
              v-model="taskForm.name"
              type="text"
              required
              :disabled="!canEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
            />
          </div>

          <!-- Описание -->
          <div>
            <label for="task-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              id="task-description"
              v-model="taskForm.description"
              rows="3"
              :disabled="!canEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
            ></textarea>
          </div>

          <!-- Статус -->
          <div>
            <label for="task-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Статус
            </label>
            <select
              id="task-status"
              v-model="taskForm.status"
              :disabled="!canEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
            >
              <option value="pending">Ожидает</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
            </select>
          </div>

          <!-- Информация о заказе (только для чтения) -->
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Информация о заказе</h4>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Заказ: #{{ selectedTask.orderId }}</p>
              <p>Клиент: {{ selectedTask.clientName }}</p>
              <p>Автомобиль: {{ selectedTask.carName }}</p>
              <p>Стоимость: {{ formatCurrency(selectedTask.cost) }}</p>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div v-if="canEdit" class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              @click="closeTaskModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
          <div v-else class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              @click="closeTaskModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'

export default {
  name: 'Executor',
  setup() {
    const authStore = useAuthStore()
    const ordersStore = useOrdersStore()

    const isLoading = ref(false)
    const error = ref(null)
    const showTaskModal = ref(false)
    const selectedTask = ref(null)
    const isSaving = ref(false)

    const taskForm = ref({
      name: '',
      description: '',
      status: 'pending'
    })

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

    onMounted(loadData)

    // Получение задач текущего исполнителя
    const myTasks = computed(() => {
      const currentUserId = authStore.userId
      const allTasks = []

      console.log('=== EXECUTOR TASKS DEBUG ===')
      console.log('Current user ID:', currentUserId)
      console.log('Orders count:', ordersStore.orders.length)

      ordersStore.orders.forEach(order => {
        console.log('Processing order:', order.id, 'works count:', order.works?.length || 0)

        if (order.works && order.works.length > 0) {
          order.works.forEach(work => {
            console.log('Processing work:', work.id, 'executor:', work.executor, 'status:', work.status_of_work)

            // Проверяем, является ли текущий пользователь исполнителем этой работы
            let isExecutor = false

            if (work.executor) {
              if (Array.isArray(work.executor)) {
                // Если executor - массив
                console.log('Executor is array with length:', work.executor.length)
                if (work.executor.length > 0) {
                  work.executor.forEach(exec => {
                    console.log('Checking executor:', exec.id, 'vs current user:', currentUserId, 'match:', exec.id === currentUserId)
                  })
                  isExecutor = work.executor.some(exec => {
                    return exec.id === currentUserId
                  })
                } else {
                  console.log('Executor array is empty for work', work.id)
                }
              } else if (work.executor.id) {
                // Если executor - объект
                console.log('Executor is object:', work.executor.id, 'vs current user:', currentUserId, 'match:', work.executor.id === currentUserId)
                isExecutor = work.executor.id === currentUserId
              } else if (work.executor === currentUserId) {
                // Если executor - просто ID
                console.log('Executor as ID:', work.executor, 'vs current user:', currentUserId, 'match:', work.executor === currentUserId)
                isExecutor = true
              } else {
                console.log('Executor field exists but has unexpected format:', work.executor)
              }
            } else {
              console.log('No executor field for work', work.id)
            }

            console.log('Is executor for work', work.id, ':', isExecutor)

            if (isExecutor) {
              console.log('Adding work to tasks:', work.id)
              allTasks.push({
                id: work.id,
                name: work.name,
                description: work.description,
                status: work.status_of_work,
                cost: work.cost || 0,
                createdAt: work.createdAt,
                completedAt: work.updatedAt, // Примерно, можно улучшить
                orderId: order.id,
                clientName: order.client?.name || 'Неизвестный клиент',
                carName: `${order.car?.make || ''} ${order.car?.model || ''}`.trim() || 'Неизвестный автомобиль',
                order: order
              })
            }
          })
        }
      })

      console.log('Total tasks found for executor:', allTasks.length)
      console.log('=== END EXECUTOR TASKS DEBUG ===')
      return allTasks
    })

    // Текущие задачи (ожидают или в работе)
    const currentTasks = computed(() => {
      return myTasks.value.filter(task =>
        task.status === 'pending' || task.status === 'in_progress'
      )
    })

    // Завершенные задачи
    const completedTasks = computed(() => {
      return myTasks.value.filter(task => task.status === 'completed')
    })

    // Методы для работы с задачами
    const openTaskModal = (task) => {
      selectedTask.value = task
      taskForm.value = {
        name: task.name || '',
        description: task.description || '',
        status: task.status || 'pending'
      }
      showTaskModal.value = true
    }

    const closeTaskModal = () => {
      showTaskModal.value = false
      selectedTask.value = null
      taskForm.value = {
        name: '',
        description: '',
        status: 'pending'
      }
    }

    const canEdit = computed(() => {
      return selectedTask.value && selectedTask.value.status !== 'completed'
    })

    const saveTask = async () => {
      if (!selectedTask.value || !canEdit.value) return

      isSaving.value = true
      try {
        const updatedData = {
          name: taskForm.value.name,
          description: taskForm.value.description,
          status_of_work: taskForm.value.status,
          order: selectedTask.value.order.id
        }

        await ordersStore.updateWork(selectedTask.value.id, updatedData)
        closeTaskModal()
        // Перезагрузка данных
        await loadData()
      } catch (err) {
        console.error('Ошибка сохранения задачи:', err)
        alert('Ошибка при сохранении задачи: ' + err.message)
      } finally {
        isSaving.value = false
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
        year: 'numeric'
      })
    }

    return {
      isLoading,
      error,
      currentTasks,
      completedTasks,
      showTaskModal,
      selectedTask,
      taskForm,
      isSaving,
      canEdit,
      openTaskModal,
      closeTaskModal,
      saveTask,
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
