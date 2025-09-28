<template>
  <div class="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
    <!-- Заголовок с чекбоксом и статусом -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center flex-1">
        <input
          :id="'checkbox-' + work.id"
          type="checkbox"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 mr-3 flex-shrink-0"
          :checked="isSelected"
          @change="$emit('toggle-select', work.id)"
        >
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ work.name }}
          </h3>
        </div>
      </div>
      <div class="flex-shrink-0 ml-3">
        <span
          :class="getStatusBadgeClass(work.status_of_work)"
          class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap"
        >
          {{ getStatusText(work.status_of_work) }}
        </span>
      </div>
    </div>

    <!-- Описание работы -->
    <div v-if="work.description" class="mb-4">
      <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
        {{ work.description }}
      </p>
    </div>

    <!-- Информация об исполнителе -->
    <div v-if="getWorkExecutorDisplayInfo(work, executors) !== 'Не назначен'" class="mb-4">
      <div class="text-sm">
        <span class="text-gray-500 dark:text-gray-400">Исполнитель:</span>
        <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">
          {{ getWorkExecutorDisplayInfo(work, executors) }}
        </span>
      </div>
    </div>

    <!-- Разделитель -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Стоимость:</span>
          <span class="ml-2 text-xl font-bold text-amber-600 dark:text-amber-400">{{ work.cost }} ₽</span>
        </div>
        
        <!-- Кнопки действий -->
        <div class="flex space-x-1">
          <button
            @click="$emit('edit', work)"
            class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
            title="Редактировать"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="confirmDelete"
            class="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
            title="Удалить"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getWorkExecutorDisplayInfo } from '../utils/executorUtils'
import { getStatusText, getStatusBadgeClass } from '../utils/statusUtils'

const props = defineProps({
  work: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  executors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-select'])

const confirmDelete = () => {
  emit('delete', props.work.id) // Удаляем без подтверждения
}
</script>

<style scoped>
/* Стили для переноса строк в описании работ */
</style>
