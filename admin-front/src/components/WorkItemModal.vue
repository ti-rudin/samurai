<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="closeModal">
    <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
      <!-- Header - fixed at top -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg sm:text-xl font-semibold">{{ work.id ? 'Редактировать работу' : 'Добавить работу' }}</h3>
        <button @click="closeModal" class="text-gray-600 hover:text-gray-900 dark:hover:text-white p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <form @submit.prevent="saveWork" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold" for="name">Название *</label>
          <input v-model="form.name" id="name" type="text" required
            class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200" />
        </div>
        <div>
          <label class="block mb-1 font-semibold" for="description">Описание</label>
          <textarea v-model="form.description" id="description" rows="3"
            class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200"></textarea>
        </div>
        <div>
          <label class="block mb-1 font-semibold" for="cost">Стоимость (₽) *</label>
          <input v-model.number="form.cost" id="cost" type="number" min="0" required
            class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200" />
        </div>
        <div>
          <label class="block mb-1 font-semibold" for="status">Статус *</label>
          <select v-model="form.status" id="status" required
            class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200">
            <option v-for="statusOption in allStatuses" :key="statusOption.value" :value="statusOption.value">
              {{ statusOption.label }}
            </option>
          </select>
          <!-- Note: Frontend uses 'status' but it will be mapped to 'status_of_work' when saving -->
        </div>
        <!-- Поле процента вознаграждения (появляется только при наличии исполнителей) -->
        <div v-if="form.executorPays.length > 0" class="mb-4">
          <label class="block mb-1 font-semibold" for="executorPercentage">
            Процент исполнителям от стоимости работы (%) *
          </label>
          <input
            v-model.number="form.executorPercentage"
            id="executorPercentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            :class="{ 'border-red-500': hasPercentageError }"
            class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200"
          />
          <p v-if="hasPercentageError" class="text-red-500 text-sm mt-1">
            Укажите процент вознаграждения (0-100)
          </p>

          <!-- Быстрые кнопки для выбора процента -->
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              @click="setPercentage(25)"
              class="px-3 py-1 text-sm bg-blue-100 text-blue-800 border border-blue-300 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              25%
            </button>
            <button
              type="button"
              @click="setPercentage(33.33)"
              class="px-3 py-1 text-sm bg-green-100 text-green-800 border border-green-300 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-800 transition-colors"
            >
              33%
            </button>
            <button
              type="button"
              @click="setPercentage(50)"
              class="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 border border-yellow-300 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-800 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              @click="setPercentage(100)"
              class="px-3 py-1 text-sm bg-purple-100 text-purple-800 border border-purple-300 rounded hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-800 transition-colors"
            >
              100%
            </button>
          </div>
        </div>

        <!-- Секция исполнителей -->
        <div>
          <label class="block mb-2 font-semibold">Исполнители</label>

          <!-- Кнопка добавления исполнителя -->
          <button
            type="button"
            @click="openExecutorSelector"
            class="mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Добавить исполнителя</span>
          </button>

          <!-- Таблица исполнителей -->
          <ExecutorTable
            :executor-pays="form.executorPays"
            :executors="executors"
            :has-validation-error="hasValidationError"
            :cost="form.cost"
            :executor-percentage="form.executorPercentage"
            @update-percentage="updateExecutorPercentage"
            @remove-executor="removeExecutor"
          />
        </div>

        <!-- Модалка выбора исполнителя -->
        <ExecutorSelectorModal
          :show="showExecutorSelector"
          :executors="executors"
          :exclude-ids="currentExecutorIds"
          @select="addExecutor"
          @close="closeExecutorSelector"
        />


          <div class="flex items-center">
            <input v-model="form.isRecomended" id="isRecomended" type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
            <label for="isRecomended" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Рекомендуемая работа
            </label>
          </div>
        </form>
      </div>

      <!-- Footer with buttons - fixed at bottom -->
      <div class="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 transition-colors">Отмена</button>
        <button type="submit" @click="saveWork" class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">Сохранить</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { normalizeExecutorForCheckboxes } from '../utils/executorUtils'
import { getAllStatuses } from '../utils/statusUtils'
import { useExecutors } from '../composables/useExecutors'
import ExecutorSelectorModal from './ExecutorSelectorModal.vue'
import ExecutorTable from './ExecutorTable.vue'
import {
  addExecutorWithEqualShare,
  removeExecutorAndRedistribute,
  validateExecutorPaysSum
} from '../utils/executorUtils'
import { useSettingsStore } from '../stores/settings'

const props = defineProps({
  show: Boolean,
  work: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      cost: 0,
      status: 'pending',
      executor: null
    })
  },
  executors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'close'])

const form = ref({
  name: props.work.name || '',
  description: props.work.description || '',
  cost: props.work.cost || 0,
  status: props.work.status || 'pending',
  executorPays: props.work.executorPays || [],
  executorPercentage: props.work.executorPercentage || null,
  isRecomended: props.work.isRecomended || false
})

// Состояние модалки выбора исполнителя
const showExecutorSelector = ref(false)
const hasValidationError = ref(false)

const { executors, loading: isLoadingExecutors, loadExecutors } = useExecutors()

// Вычисляемые свойства для валидации
const hasPercentageError = ref(false)

// Вычисляемое свойство для всех статусов
const allStatuses = computed(() => getAllStatuses())

// ID текущих исполнителей для исключения из выбора
const currentExecutorIds = computed(() => {
  return form.value.executorPays.map(pay => pay.id)
})

// Функция для обновления формы
const updateForm = () => {
  form.value = {
    name: props.work?.name || '',
    description: props.work?.description || '',
    cost: props.work?.cost || 0,
    status: props.work?.status || props.work?.status_of_work || 'pending',
    executorPays: props.work?.executorPays || [],
    executorPercentage: props.work?.executorPercentage || null,
    isRecomended: props.work?.isRecomended || false
  }

  // Сбрасываем ошибки валидации
  hasPercentageError.value = false
  hasValidationError.value = false
}

// Обновляем форму при изменении пропса work
watch(() => props.work, () => {
  updateForm()
}, { deep: true, immediate: true })

// Обновляем форму при открытии модального окна
watch(() => props.show, (newShow) => {
  if (newShow) {
    updateForm()
    // Блокируем прокрутку body при открытии модалки
    document.body.style.overflow = 'hidden'
  } else {
    // Восстанавливаем прокрутку body при закрытии модалки
    document.body.style.overflow = ''
  }
})

// Очистка при размонтировании компонента
import { onUnmounted } from 'vue'

onUnmounted(() => {
  document.body.style.overflow = ''
})

onMounted(async () => {
  // Загружаем исполнителей при монтировании компонента
  await loadExecutors()
})

// Функция валидации формы
function validateForm() {
  let isValid = true

  // Проверяем executorPercentage, если есть исполнители
  if (form.value.executorPays.length > 0) {
    const percentage = form.value.executorPercentage
    if (percentage === null || percentage === undefined || percentage === '' ||
        isNaN(percentage) || percentage < 0 || percentage > 100) {
      hasPercentageError.value = true
      isValid = false
    } else {
      hasPercentageError.value = false
    }
  } else {
    hasPercentageError.value = false
  }

  // Проверяем сумму долей в executorPays
  if (form.value.executorPays.length > 0) {
    if (!validateExecutorPaysSum(form.value.executorPays)) {
      hasValidationError.value = true
      isValid = false
    } else {
      hasValidationError.value = false
    }
  } else {
    hasValidationError.value = false
  }

  return isValid
}

function saveWork() {
  // Валидируем форму перед сохранением
  if (!validateForm()) {
    return
  }

  // Получаем orderId из текущего маршрута
  const currentRoute = window.location.pathname
  const orderIdMatch = currentRoute.match(/\/orders\/(\d+)\/edit/)
  const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null

  // Получаем массив ID исполнителей из executorPays
  const executorIds = form.value.executorPays.map(pay => pay.id)

  // Подготавливаем данные для сохранения
  const workData = {
    id: props.work?.id || null,
    name: form.value.name,
    description: form.value.description,
    cost: form.value.cost,
    status_of_work: form.value.status,
    executor: executorIds, // Добавляем executor как массив ID
    executorPays: JSON.stringify(form.value.executorPays),
    executorPercentage: form.value.executorPercentage,
    isRecomended: form.value.isRecomended,
    order: orderId
  }

  console.log('[WorkItemModal] Final workData:', workData)
  console.log('[WorkItemModal] executorPays:', form.value.executorPays)
  console.log('[WorkItemModal] executor IDs:', executorIds)

  emit('save', workData)
  closeModal()
}

function closeModal() {
  emit('close')
}

// Функция для установки процента через быстрые кнопки
function setPercentage(value) {
  form.value.executorPercentage = value
  // Сбрасываем ошибку валидации при установке значения
  hasPercentageError.value = false
}

// Функции для работы с исполнителями
function openExecutorSelector() {
  showExecutorSelector.value = true
}

function closeExecutorSelector() {
  showExecutorSelector.value = false
}

function addExecutor(executorId) {
  const settingsStore = useSettingsStore();

  form.value.executorPays = addExecutorWithEqualShare(form.value.executorPays, executorId, executors.value)
  showExecutorSelector.value = false

  // Устанавливаем executorPercentage по умолчанию из настроек, если не установлено
  if (form.value.executorPercentage === null || form.value.executorPercentage === undefined) {
    form.value.executorPercentage = settingsStore.executorPercentage
  }
}

function removeExecutor(executorId) {
  form.value.executorPays = removeExecutorAndRedistribute(form.value.executorPays, executorId)
}

function updateExecutorPercentage(data) {
  const { executorId, percentage } = data
  const index = form.value.executorPays.findIndex(pay => pay.id === executorId)
  if (index !== -1) {
    form.value.executorPays[index].percentage = percentage
  }
}
</script>
