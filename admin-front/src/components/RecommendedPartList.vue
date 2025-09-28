<template>
  <div>
    <!-- Таблица рекомендованных запчастей -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">
              Название
            </th>
            <th scope="col" class="px-6 py-3">
              Артикул
            </th>
            <th scope="col" class="px-6 py-3">
              Количество
            </th>
            <th scope="col" class="px-6 py-3">
              Цена
            </th>
            <th scope="col" class="px-6 py-3">
              Сумма
            </th>
            <th scope="col" class="px-6 py-3">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="part in parts"
            :key="part.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ part.name }}
            </td>
            <td class="px-6 py-4">
              {{ part.number || '-' }}
            </td>
            <td class="px-6 py-4">
              {{ part.quantity }}
            </td>
            <td class="px-6 py-4">
              {{ part.price }} руб.
            </td>
            <td class="px-6 py-4">
              {{ part.quantity * part.price }} руб.
            </td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button
                  @click="$emit('add-recommended-part', part)"
                  class="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                  title="Добавить"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  @click="$emit('edit-recommended-part', part)"
                  class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                  title="Редактировать"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete-recommended-part', part.id)"
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
      <div v-if="!parts || parts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        Нет рекомендованных запчастей
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="part in parts"
          :key="part.id"
          class="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <!-- Заголовок и действия -->
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-3">{{ part.name }}</h3>
            <div class="flex space-x-1 flex-shrink-0">
              <button
                @click="$emit('add-recommended-part', part)"
                class="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors duration-200"
                title="Добавить"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                @click="$emit('edit-recommended-part', part)"
                class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
                title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="$emit('delete-recommended-part', part.id)"
                class="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
                title="Удалить"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Артикул -->
          <div v-if="part.number" class="mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Артикул: <span class="font-medium">{{ part.number }}</span>
            </p>
          </div>
          
          <!-- Детали расчета -->
          <div class="mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ part.quantity }} шт. × {{ part.price }} ₽
            </p>
          </div>
          
          <!-- Разделитель -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <!-- Итоговая стоимость -->
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Итого:</span>
              <span class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ part.quantity * part.price }} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-if="!parts || parts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      Нет рекомендованных запчастей
    </div>
  </div>
</template>

<script setup>
defineProps({
  parts: {
    type: Array,
    required: true
  }
})

defineEmits(['add-recommended-part', 'edit-recommended-part', 'delete-recommended-part'])

const getStatusText = (status) => {
  const statuses = {
    'pending_from_client': 'Ожидает клиента',
    'ordered': 'Заказана',
    'in_stock': 'На складе',
    'installed': 'Установлена'
  }
  return statuses[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'pending_from_client': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'ordered': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'in_stock': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'installed': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
