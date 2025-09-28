<template>
  <div>
    <!-- Панель массовых операций -->
    <div v-if="selectedParts.length > 0" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">
          Выбрано запчастей: {{ selectedParts.length }}
        </span>
        <div class="flex space-x-2">
          <button @click="confirmBatchDelete" class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Десктопное представление (таблица) -->
    <div class="hidden md:block">
      <PartTable :parts="parts" :selected-parts="selectedParts" @edit="editPart" @delete="deletePart"
        @batch-delete="handleBatchDelete" @toggle-select="toggleSelect" @toggle-select-all="toggleSelectAll" />
    </div>

    <!-- Мобильное представление (карточки) -->
    <div class="md:hidden">
      <div v-if="!parts || parts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        Нет добавленных запчастей
      </div>

      <div v-else class="space-y-4">
        <div v-for="part in parts" :key="part.id"
          class="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
          
          <!-- Заголовок с чекбоксом и статусом -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center flex-1">
              <input type="checkbox" :checked="isSelected(part.id)" @change="toggleSelect(part.id)"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 mr-3 flex-shrink-0">
              <div class="flex-1 min-w-0">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ part.name }}</h4>
                <p v-if="part.number" class="text-sm text-gray-600 dark:text-gray-400">№ {{ part.number }}</p>
              </div>
            </div>
            <div class="flex-shrink-0 ml-3">
              <span :class="getStatusBadgeClass(part.partstatus)" class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap">
                {{ getStatusText(part.partstatus) }}
              </span>
            </div>
          </div>

          <!-- Детали -->
          <div class="mb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">Цена:</span>
                <span class="ml-1 font-medium">{{ part.price }} ₽</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Кол-во:</span>
                <span class="ml-1 font-medium">{{ part.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- Разделитель -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Итого:</span>
                <span class="ml-2 text-xl font-bold text-amber-600 dark:text-amber-400">{{ (part.quantity * part.price).toFixed(2) }} ₽</span>
              </div>
              
              <!-- Кнопки действий -->
              <div class="flex space-x-1">
                <button @click="editPart(part)"
                  class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
                  title="Редактировать">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="removePart(part)"
                  class="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
                  title="Удалить">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения массового удаления -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Подтверждение удаления</h3>
        <p class="mb-4">
          Вы уверены, что хотите удалить {{ selectedParts.length }} запчастей?
        </p>
        <div class="flex justify-end space-x-2">
          <button @click="showDeleteConfirm = false"
            class="px-4 py-2 border rounded dark:border-gray-600 dark:hover:bg-gray-700">
            Отмена
          </button>
          <button @click="executeBatchDelete" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PartTable from './PartTable.vue'

const props = defineProps({
  parts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'batch-delete'])

const selectedParts = ref([])
const showDeleteConfirm = ref(false)

const isSelected = (partId) => {
  return selectedParts.value.includes(partId)
}

const toggleSelect = (partId) => {
  const index = selectedParts.value.indexOf(partId)
  if (index > -1) {
    selectedParts.value.splice(index, 1)
  } else {
    selectedParts.value.push(partId)
  }
}

const toggleSelectAll = () => {
  if (selectedParts.value.length === props.parts.length) {
    selectedParts.value = []
  } else {
    selectedParts.value = props.parts.map(part => part.id)
  }
}

const editPart = (part) => {
  emit('edit', part)
}

const removePart = (part) => {
  emit('delete', part.id) // Передаем только ID запчасти
}

const deletePart = (partId) => {
  emit('delete', partId) // Обработчик для PartTable
}

const handleBatchDelete = (partIds) => {
  selectedParts.value = partIds
  showDeleteConfirm.value = true
}

const confirmBatchDelete = () => {
  showDeleteConfirm.value = true
}

const executeBatchDelete = () => {
  emit('batch-delete', selectedParts.value)
  selectedParts.value = []
  showDeleteConfirm.value = false
}

const getStatusText = (status) => {
  const statuses = {
    'pending_from_client': 'Ожидаем от клиента',
    'need_to_order': 'Надо заказать',
    'ordered': 'Заказано',
    'onbase': 'На базе'
  }
  return statuses[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'pending_from_client': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'need_to_order': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'ordered': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'onbase': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}
</script>

<style scoped>
/* Адаптивные стили для переключения между представлениями */
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
