<template>
  <div>
    <!-- Таблица рекомендованных работ -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">
              Название
            </th>
            <th scope="col" class="px-6 py-3">
              Описание
            </th>
            <th scope="col" class="px-6 py-3">
              Стоимость
            </th>
            <th scope="col" class="px-6 py-3">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="work in works"
            :key="work.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ work.name }}
            </td>
            <td class="px-6 py-4 max-w-xs">
              <div class="truncate" :title="work.description">
                {{ work.description || '-' }}
              </div>
            </td>
            <td class="px-6 py-4">
              {{ work.cost }} руб.
            </td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button
                  @click="$emit('add-recommended-work', work)"
                  class="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                  title="Добавить"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  @click="$emit('edit-recommended-work', work)"
                  class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                  title="Редактировать"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete-recommended-work', work.id)"
                  class="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  title="Удалить"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Мобильное представление (карточки) -->
    <div class="md:hidden">
      <div v-if="!works || works.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        Нет рекомендованных работ
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="work in works"
          :key="work.id"
          class="relative p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Действия в правом верхнем углу -->
          <div class="absolute top-3 right-3 flex space-x-1">
            <button
              @click="$emit('add-recommended-work', work)"
              class="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
              title="Добавить"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              @click="$emit('edit-recommended-work', work)"
              class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              title="Редактировать"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="$emit('delete-recommended-work', work.id)"
              class="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              title="Удалить"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <!-- Название работы -->
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-24">{{ work.name }}</h3>
          
          <!-- Описание -->
          <p v-if="work.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            {{ work.description }}
          </p>

          <!-- Исполнитель (если есть) -->
          <div v-if="getWorkExecutorDisplayInfo(work, executors) !== 'Не назначен'" class="mb-3">
            <div class="text-sm">
              <span class="text-gray-500 dark:text-gray-400">Исполнитель:</span>
              <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">
                {{ getWorkExecutorDisplayInfo(work, executors) }}
              </span>
            </div>
          </div>

          <!-- Стоимость внизу -->
          <div class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Стоимость:</span>
            <span class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ work.cost }} ₽</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-if="!works || works.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      Нет рекомендованных работ
    </div>
  </div>
</template>

<script setup>
import { getWorkExecutorDisplayInfo } from '../utils/executorUtils'

defineProps({
  works: {
    type: Array,
    required: true
  },
  executors: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add-recommended-work', 'edit-recommended-work', 'delete-recommended-work'])

const getStatusText = (status) => {
  const statuses = {
    'pending': 'Ожидает',
    'in_progress': 'В работе',
    'completed': 'Завершена'
  }
  return statuses[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getExecutorName = (executor) => {
  if (!executor) return 'Не назначен'

  // Если executor - это массив (manyToMany relation)
  if (Array.isArray(executor)) {
    if (executor.length === 0) return 'Не назначен'
    if (executor.length === 1) {
      // Один исполнитель - обработаем его
      return getSingleExecutorName(executor[0])
    } else {
      // Несколько исполнителей - возвращаем список имен через запятую
      const executorNames = executor.map(exec => getSingleExecutorName(exec)).filter(name => name !== 'Не назначен');
      return executorNames.length > 0 ? executorNames.join(', ') : 'Не назначен';
    }
  }

  // Если executor - одиночный объект или ID
  return getSingleExecutorName(executor)
}

const getSingleExecutorName = (executor) => {
  if (!executor) return 'Не назначен'

  // Проверяем на поврежденные данные
  if (typeof executor === 'object' && executor.username === 'Исполнитель #undefined') {
    return 'Не назначен'
  }

  // Если executor - это объект с данными
  if (typeof executor === 'object') {
    // Проверяем, содержит ли username уже готовую строку
    if (executor.username && !executor.username.includes('#undefined')) {
      return executor.username
    }

    if (executor.name) {
      return executor.name
    }

    // Strapi v4 format
    if (executor.data?.attributes?.username) return executor.data.attributes.username
    if (executor.data?.attributes?.name) return executor.data.attributes.name

    // Вложенные атрибуты
    if (executor.attributes?.username) return executor.attributes.username
    if (executor.attributes?.name) return executor.attributes.name

    // ID для поиска в списке исполнителей
    if (executor.id !== undefined && executor.id !== null && typeof executor.id === 'number') {
      const foundExecutor = props.executors.find(e => e.id === executor.id)
      return foundExecutor ? foundExecutor.username : `Исполнитель #${executor.id}`
    }
  }

  // Если executor - это просто ID
  if (typeof executor === 'number' || (typeof executor === 'string' && !isNaN(executor))) {
    const executorId = Number(executor)
    if (executorId && typeof executorId === 'number') {
      const foundExecutor = props.executors.find(e => e.id === executorId)
      return foundExecutor ? foundExecutor.username : `Исполнитель #${executorId}`
    }
  }

  return 'Не назначен'
}
</script>

<style scoped>
@media (max-width: 768px) {
  .hidden.md\:block {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .md\:hidden {
    display: none !important;
  }
}
</style>
