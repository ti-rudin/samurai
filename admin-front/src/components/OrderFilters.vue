<template>
  <div class="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <!-- Поле поиска -->
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Поиск по заказам
        </label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по ID заказа, клиенту, автомобилю..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="onSearchInput"
        />
      </div>

      <!-- Фильтр по статусу -->
      <div class="w-full md:w-48">
        <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Статус
        </label>
        <select
          id="status-filter"
          v-model="selectedStatus"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @change="onStatusChange"
        >
          <option value="">Все статусы</option>
          <option value="new">Новый</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Завершен</option>
          <option value="cancelled">Отменен</option>
        </select>
      </div>

      <!-- Фильтр по клиенту -->
      <div class="w-full md:w-48">
        <label for="client-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Клиент
        </label>
        <select
          id="client-filter"
          v-model="selectedClient"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @change="onClientChange"
        >
          <option value="">Все клиенты</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>

      <!-- Кнопка сброса фильтров -->
      <div class="w-full md:w-auto">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 opacity-0">
          Действия
        </label>
        <button
          @click="resetFilters"
          class="w-full md:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          :disabled="!hasActiveFilters"
        >
          Сбросить
        </button>
      </div>
    </div>

    <!-- Активные фильтры -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">Активные фильтры:</span>

      <span v-if="searchQuery" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
        Поиск: "{{ searchQuery }}"
        <button @click="clearSearch" class="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          ×
        </button>
      </span>

      <span v-if="selectedStatus" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        Статус: {{ getStatusText(selectedStatus) }}
        <button @click="clearStatus" class="ml-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
          ×
        </button>
      </span>

      <span v-if="selectedClient" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        Клиент: {{ getClientName(selectedClient) }}
        <button @click="clearClient" class="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
          ×
        </button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  clients: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter', 'search', 'reset'])

// Реактивные данные
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedClient = ref('')

// Вычисляемые свойства
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value || selectedClient.value
})

// Методы
const onSearchInput = () => {
  emit('search', {
    query: searchQuery.value,
    status: selectedStatus.value,
    clientId: selectedClient.value
  })
}

const onStatusChange = () => {
  emit('filter', {
    query: searchQuery.value,
    status: selectedStatus.value,
    clientId: selectedClient.value
  })
}

const onClientChange = () => {
  emit('filter', {
    query: searchQuery.value,
    status: selectedStatus.value,
    clientId: selectedClient.value
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedClient.value = ''
  emit('reset')
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', {
    query: '',
    status: selectedStatus.value,
    clientId: selectedClient.value
  })
}

const clearStatus = () => {
  selectedStatus.value = ''
  emit('filter', {
    query: searchQuery.value,
    status: '',
    clientId: selectedClient.value
  })
}

const clearClient = () => {
  selectedClient.value = ''
  emit('filter', {
    query: searchQuery.value,
    status: selectedStatus.value,
    clientId: ''
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'new': 'Новый',
    'in_progress': 'В работе',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  }
  return statusMap[status] || status
}

const getClientName = (clientId) => {
  const client = props.clients.find(c => c.id === clientId)
  return client ? client.name : 'Неизвестный клиент'
}

// Экспорт методов для внешнего использования
defineExpose({
  resetFilters,
  hasActiveFilters
})
</script>
