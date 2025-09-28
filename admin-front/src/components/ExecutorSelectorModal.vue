<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
        <!-- Header - fixed at top -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Выберите исполнителя</h3>
          <button @click="closeModal" class="text-gray-600 hover:text-gray-900 dark:hover:text-white p-1">
            <svg class="w-5 w-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div class="space-y-2">
            <div v-for="executor in availableExecutors" :key="executor.id"
              class="flex items-center space-x-3 p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              @click="selectExecutor(executor.id)">
              <div class="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg v-if="selectedExecutorId === executor.id" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ executor.name || executor.username }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ executor.id }}</div>
              </div>
            </div>

            <div v-if="availableExecutors.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              Нет доступных исполнителей
            </div>
          </div>
        </div>

        <!-- Footer with buttons - fixed at bottom -->
        <div class="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 transition-colors">
            Отмена
          </button>
          <button
            type="button"
            @click="confirmSelection"
            :disabled="!selectedExecutorId"
            class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            Выбрать
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  executors: {
    type: Array,
    default: () => []
  },
  excludeIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'close'])

const selectedExecutorId = ref(null)

// Доступные исполнители (исключая уже выбранных)
const availableExecutors = computed(() => {
  return props.executors.filter(executor =>
    !props.excludeIds.includes(executor.id)
  )
})

// Сброс выбора при открытии модалки
watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedExecutorId.value = null
    // Блокируем прокрутку body при открытии модалки
    document.body.style.overflow = 'hidden'
  } else {
    // Восстанавливаем прокрутку body при закрытии модалки
    document.body.style.overflow = ''
  }
})

function selectExecutor(executorId) {
  selectedExecutorId.value = executorId
}

function confirmSelection() {
  if (selectedExecutorId.value) {
    emit('select', selectedExecutorId.value)
    closeModal()
  }
}

function closeModal() {
  emit('close')
}

// Очистка при размонтировании компонента
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
