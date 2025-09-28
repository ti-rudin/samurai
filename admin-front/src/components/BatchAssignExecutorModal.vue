<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
      <h3 class="text-xl font-semibold mb-4">Назначить исполнителя</h3>
      
      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Выбрано работ: {{ selectedWorks.length }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Выберите исполнителя
        </label>
        <select
          v-model="selectedExecutor"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">Выберите исполнителя</option>
          <option
            v-for="executor in executors"
            :key="executor.id"
            :value="executor.id"
          >
            {{ executor.username || executor.name }}
          </option>
        </select>
      </div>

      <!-- Поле процента вознаграждения -->
      <div class="mb-4">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Процент вознаграждения (%) *
        </label>
        <input
          v-model.number="executorPercentage"
          type="number"
          min="0"
          max="100"
          step="0.1"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          :class="{ 'border-red-500': hasPercentageError }"
        />
        <p v-if="hasPercentageError" class="text-red-500 text-xs mt-1">
          Укажите процент вознаграждения (0-100)
        </p>
      </div>

      <div class="flex justify-end space-x-2">
        <button
          @click="close"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Отмена
        </button>
        <button
          @click="assignExecutor"
          type="button"
          :disabled="!selectedExecutor"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Назначить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  selectedWorks: {
    type: Array,
    required: true
  },
  executors: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['assign', 'close'])

const selectedExecutor = ref('')
const executorPercentage = ref(null)
const hasPercentageError = ref(false)

// Функция валидации
function validateForm() {
  let isValid = true

  if (!selectedExecutor.value) {
    isValid = false
  }

  // Проверяем процент только если выбран исполнитель
  if (selectedExecutor.value) {
    const percentage = executorPercentage.value
    if (percentage === null || percentage === undefined || percentage === '' ||
        isNaN(percentage) || percentage < 0 || percentage > 100) {
      hasPercentageError.value = true
      isValid = false
    } else {
      hasPercentageError.value = false
    }
  } else {
    // Если исполнитель не выбран, сбрасываем ошибку процента
    hasPercentageError.value = false
  }

  return isValid
}

const assignExecutor = () => {
  // Валидируем форму перед отправкой
  if (!validateForm()) {
    return
  }

  emit('assign', {
    workIds: props.selectedWorks,
    executorId: selectedExecutor.value,
    executorPercentage: executorPercentage.value
  })

  // Сбрасываем форму
  selectedExecutor.value = ''
  executorPercentage.value = null
  hasPercentageError.value = false
}

const close = () => {
  selectedExecutor.value = ''
  executorPercentage.value = null
  hasPercentageError.value = false
  emit('close')
}
</script>
