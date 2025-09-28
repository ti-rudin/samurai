<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="checkbox-all-recommended"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              >
              <label for="checkbox-all-recommended" class="sr-only">checkbox</label>
            </div>
          </th>
          <th scope="col" class="px-6 py-3">Номер</th>
          <th scope="col" class="px-6 py-3">Наименование</th>
          <th scope="col" class="px-6 py-3">Цена</th>
          <th scope="col" class="px-6 py-3">Кол-во</th>
          <th scope="col" class="px-6 py-3">Сумма</th>
          <th scope="col" class="px-6 py-3">Статус</th>
          <th scope="col" class="px-6 py-3">Действия</th>
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
                :id="'checkbox-recommended-' + part.id"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                :checked="isSelected(part.id)"
                @change="toggleSelect(part.id)"
              >
              <label :for="'checkbox-recommended-' + part.id" class="sr-only">checkbox</label>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ part.number }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ part.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ part.price }} руб.</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ part.quantity }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ (part.quantity * part.price).toFixed(2) }} руб.</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              :class="getStatusBadgeClass(part.partstatus)"
              class="px-2 py-1 text-xs font-medium rounded-full"
              style="white-space: nowrap"
            >
              {{ getStatusText(part.partstatus) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button @click="editRecommendedPart(part)" 
                class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Редактировать">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="deleteRecommendedPart(part)" 
                class="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Удалить">
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
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  parts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-select', 'toggle-select-all'])

const selectedParts = ref([])

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
  emit('toggle-select', partId)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedParts.value = []
  } else {
    selectedParts.value = props.parts.map(part => part.id)
  }
  emit('toggle-select-all')
}

const editRecommendedPart = (part) => {
  emit('edit', part)
}

const deleteRecommendedPart = (part) => {
  emit('delete', part)
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
/* Стили для таблицы рекомендуемых запчастей */
</style>
