<template>
  <div class="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <!-- Поле поиска -->
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Поиск по клиентам
        </label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по имени, телефону, адресу..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="onSearchInput"
        />
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
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ClientFilters',
  emits: ['filter', 'search', 'reset'],
  setup(props, { emit }) {
    const searchQuery = ref('')

    const hasActiveFilters = computed(() => {
      return searchQuery.value
    })

    const onSearchInput = () => {
      emit('search', {
        query: searchQuery.value
      })
    }

    const resetFilters = () => {
      searchQuery.value = ''
      emit('reset')
    }

    const clearSearch = () => {
      searchQuery.value = ''
      emit('search', { query: '' })
    }

    return {
      searchQuery,
      hasActiveFilters,
      onSearchInput,
      resetFilters,
      clearSearch
    }
  }
}
</script>
