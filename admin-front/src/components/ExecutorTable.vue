<template>
  <div class="border rounded dark:border-gray-600">
    <div class="max-h-40 overflow-y-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Исполнитель</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Доля (%)</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">₽</th>
            <th class="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 w-12">Действия</th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="(executor, index) in executorList" :key="executor.id"
          :class="index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'">
          <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
            {{ executor.name }}
          </td>
          <td class="px-4 py-3">
            <input
              type="number"
              :value="executor.percentage"
              @input="updatePercentage(executor.id, $event.target.value)"
              min="0"
              max="100"
              step="0.01"
              :class="[
                'w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
                hasValidationError && !isValidTotal ? 'border-red-500' : 'border-gray-300'
              ]"
            />
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
            {{ formatCurrency(executor.amountInRubles) }}
          </td>
          <td class="px-4 py-3 text-center">
            <button
              @click="removeExecutor(executor.id)"
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="Удалить исполнителя">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        </tr>
          <tr v-if="executorList.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              Исполнители не назначены
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Сообщение об ошибке суммы -->
    <div v-if="hasValidationError && !isValidTotal && executorList.length > 0"
      class="px-4 py-2 bg-red-50 dark:bg-red-900 border-t border-red-200 dark:border-red-700">
      <p class="text-sm text-red-600 dark:text-red-400">
        ❌ Сумма долей должна быть 100%. Текущая сумма: {{ totalPercentage.toFixed(2) }}%
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getExecutorPaysTotal, validateExecutorPaysSum } from '../utils/executorUtils'

const props = defineProps({
  executorPays: {
    type: Array,
    default: () => []
  },
  executors: {
    type: Array,
    default: () => []
  },
  hasValidationError: {
    type: Boolean,
    default: false
  },
  cost: {
    type: Number,
    default: 0
  },
  executorPercentage: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update-percentage', 'remove-executor'])

// Преобразованный список исполнителей с именами
const executorList = computed(() => {
  return props.executorPays.map(pay => {
    const executor = props.executors.find(e => e.id === pay.id)
    const percentage = pay.percentage || 0
    // Вычисляем сумму в рублях: стоимость * процент вознаграждения / 100 * доля исполнителя / 100
    const amountInRubles = (props.cost * props.executorPercentage / 100) * (percentage / 100)

    return {
      id: pay.id,
      name: executor ? executor.name || executor.username : `Исполнитель #${pay.id}`,
      percentage: percentage,
      amountInRubles: amountInRubles
    }
  })
})

// Общая сумма процентов
const totalPercentage = computed(() => {
  return getExecutorPaysTotal(props.executorPays)
})

// Валидность суммы
const isValidTotal = computed(() => {
  return validateExecutorPaysSum(props.executorPays)
})

function updatePercentage(executorId, value) {
  const percentage = parseFloat(value) || 0
  emit('update-percentage', { executorId, percentage })
}

function removeExecutor(executorId) {
  emit('remove-executor', executorId)
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(amount))
}
</script>
