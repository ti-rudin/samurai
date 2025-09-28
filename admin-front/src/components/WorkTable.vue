<template>
  <div class="overflow-x-auto">
    <!-- Панель массовых операций -->
    <div v-if="selectedWorks.length > 0" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">
          Выбрано работ: {{ selectedWorks.length }}
        </span>
        <div class="flex space-x-2">
          <button
            @click="openBatchAssignModal"
            class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Назначить исполнителя
          </button>
          <button
            @click="confirmBatchDelete"
            class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица работ -->
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="checkbox-all"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              >
              <label for="checkbox-all" class="sr-only">checkbox</label>
            </div>
          </th>
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
            Статус
          </th>
          <th scope="col" class="px-6 py-3">
            Исполнитель
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
          <td class="w-4 p-4">
            <div class="flex items-center">
              <input
                :id="'checkbox-' + work.id"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                :checked="isSelected(work.id)"
                @change="toggleSelect(work.id)"
              >
              <label :for="'checkbox-' + work.id" class="sr-only">checkbox</label>
            </div>
          </td>
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
            <span
              :class="getStatusBadgeClass(work.status_of_work)"
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusText(work.status_of_work) }}
            </span>
          </td>
          <td class="px-6 py-4">
            {{ getWorkExecutorDisplayInfo(work, executors) }}
          </td>
          <td class="px-6 py-4">
            <div class="flex space-x-2">
              <button
                @click="$emit('edit', work)"
                class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(work.id)"
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

    <!-- Пустое состояние -->
    <div v-if="!works || works.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      Нет добавленных работ
    </div>

    <!-- Модальное окно подтверждения массового удаления -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Подтверждение удаления</h3>
        <p class="mb-4">
          Вы уверены, что хотите удалить {{ selectedWorks.length }} работ(ы)?
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
import { getWorkExecutorDisplayInfo } from '../utils/executorUtils'
import { getStatusText, getStatusBadgeClass } from '../utils/statusUtils'

const props = defineProps({
  works: {
    type: Array,
    required: true
  },
  executors: {
    type: Array,
    default: () => []
  },
  getExecutorName: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['edit', 'delete', 'batch-delete', 'batch-assign'])

const selectedWorks = ref([])
const showDeleteConfirm = ref(false)

const isAllSelected = computed(() => {
  return props.works.length > 0 && selectedWorks.value.length === props.works.length
})

const isSelected = (workId) => {
  return selectedWorks.value.includes(workId)
}

const toggleSelect = (workId) => {
  const index = selectedWorks.value.indexOf(workId)
  if (index > -1) {
    selectedWorks.value.splice(index, 1)
  } else {
    selectedWorks.value.push(workId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedWorks.value = []
  } else {
    selectedWorks.value = props.works.map(work => work.id)
  }
}

const confirmDelete = (workId) => {
  emit('delete', workId)
}

const confirmBatchDelete = () => {
  showDeleteConfirm.value = true
}

const executeBatchDelete = () => {
  emit('batch-delete', selectedWorks.value)
  selectedWorks.value = []
  showDeleteConfirm.value = false
}

const openBatchAssignModal = () => {
  emit('batch-assign', selectedWorks.value)
}
</script>
