<template>
  <div class="overflow-x-auto">
    <!-- Панель массовых операций -->
    <div v-if="selectedParts.length > 0" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">
          Выбрано запчастей: {{ selectedParts.length }}
        </span>
        <div class="flex space-x-2">
          <button
            @click="confirmBatchDelete"
            class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица запчастей -->
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="checkbox-all-parts"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              >
              <label for="checkbox-all-parts" class="sr-only">checkbox</label>
            </div>
          </th>
          <th scope="col" class="px-6 py-3">
            Номер
          </th>
          <th scope="col" class="px-6 py-3">
            Наименование
          </th>
          <th scope="col" class="px-6 py-3">
            Цена
          </th>
          <th scope="col" class="px-6 py-3">
            Кол-во
          </th>
          <th scope="col" class="px-6 py-3">
            Сумма
          </th>
          <th scope="col" class="px-6 py-3">
            Статус
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
          <td class="w-4 p-4">
            <div class="flex items-center">
              <input
                :id="'checkbox-part-' + part.id"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                :checked="isSelected(part.id)"
                @change="toggleSelect(part.id)"
              >
              <label :for="'checkbox-part-' + part.id" class="sr-only">checkbox</label>
            </div>
          </td>
          <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ part.number }}
          </td>
          <td class="px-6 py-4">
            {{ part.name }}
          </td>
          <td class="px-6 py-4">
            {{ part.quantity }}
          </td>
          <td class="px-6 py-4">
            {{ part.price }} руб.
          </td>
          <td class="px-6 py-4 font-medium">
            {{ (part.quantity * part.price).toFixed(2) }} руб.
          </td>
          <td class="px-6 py-4 ">
            <span
              :class="getStatusBadgeClass(part.partstatus)"
              class="px-2 py-1 text-xs font-medium rounded-full" style="white-space: nowrap"
            >
              {{ getStatusText(part.partstatus) }}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex space-x-2">
              <button
                @click="$emit('edit', part)"
                class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(part.id)"
                class="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
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

    <!-- Пустое состояние -->
    <div v-if="!parts || parts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      Нет добавленных запчастей
    </div>

    <!-- Модальное окно подтверждения массового удаления -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Подтверждение удаления</h3>
        <p class="mb-4">
          Вы уверены, что хотите удалить {{ selectedParts.length }} запчастей?
        </p>
        <div class="flex justify-end space-x-2">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border rounded dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Отмена
          </button>
          <button
            @click="executeBatchDelete"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  parts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'batch-delete'])

const selectedParts = ref([])
const showDeleteConfirm = ref(false)

const isAllSelected = computed(() => {
  return props.parts.length > 0 && selectedParts.value.length === props.parts.length
})

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
  if (isAllSelected.value) {
    selectedParts.value = []
  } else {
    selectedParts.value = props.parts.map(part => part.id)
  }
}

const confirmDelete = (partId) => {
  emit('delete', partId)
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
