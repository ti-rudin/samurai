<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
        <!-- Header - fixed at top -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Создать новый заказ
          </h3>
          <button @click="closeModal" class="text-gray-600 hover:text-gray-900 dark:hover:text-white p-1">
            <svg class="w-5 w-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <form @submit.prevent="createOrder" class="space-y-4">
            <!-- Выбор клиента -->
            <div>
              <label for="client-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Клиент *
              </label>
              <select
                id="client-select"
                v-model="formData.clientId"
                @change="onClientChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="" disabled selected>Выберите клиента</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Выбор автомобиля -->
            <div>
              <label for="car-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Автомобиль *
              </label>
              <select
                id="car-select"
                v-model="formData.carId"
                :disabled="!formData.clientId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
                required
              >
                <option v-if="!formData.clientId" value="" disabled selected>
                  Сначала выберите клиента
                </option>
                <option v-else-if="filteredCars.length === 0" value="" disabled>
                  У клиента нет автомобилей
                </option>
                <option v-else value="" disabled selected>
                  Выберите автомобиль
                </option>
                <option v-for="car in filteredCars" :key="car.id" :value="car.id">
                  {{ car.displayName }}
                </option>
              </select>
              <p v-if="!formData.clientId" class="text-xs text-gray-500 mt-1">
                Заполните сначала поле "Клиент", чтобы выбрать автомобиль
              </p>
            </div>

            <!-- Описание работ -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Описание работ
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                placeholder="Опишите работы, которые необходимо выполнить..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <!-- Примечания -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Примечания
              </label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="2"
                placeholder="Дополнительные примечания..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Footer with buttons - fixed at bottom -->
        <div class="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Отмена
          </button>
          <button
            type="submit"
            @click="createOrder"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Создание...' : 'Создать заказ' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  clients: {
    type: Array,
    default: () => []
  },
  cars: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['create', 'close'])

// Реактивные данные
const isSubmitting = ref(false)
const formData = ref({
  clientId: '',
  carId: '',
  description: '',
  notes: ''
})

// Вычисляемые свойства
const filteredCars = computed(() => {
  if (!formData.value.clientId) return []

  return props.cars
    .filter(car => car.clientId === formData.value.clientId)
    .map(car => ({
      ...car,
      displayName: `${car.make} ${car.model} (${car.year}) - ${car.licensePlate || 'без номера'}`
    }))
})

// Методы
const onClientChange = () => {
  // Сбрасываем выбранный автомобиль при изменении клиента
  formData.value.carId = ''
}

const createOrder = async () => {
  if (!formData.value.clientId || !formData.value.carId) {
    return
  }

  isSubmitting.value = true

  try {
    const orderData = {
      clientId: formData.value.clientId,
      carId: formData.value.carId,
      description: formData.value.description,
      notes: formData.value.notes,
      orderstatus: 'new',
      estimatedCost: 0,
      finalCost: 0,
      mechanics: []
    }

    emit('create', orderData)
    closeModal()
  } catch (error) {
    console.error('Ошибка при создании заказа:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  formData.value = {
    clientId: '',
    carId: '',
    description: '',
    notes: ''
  }
}

// Сбрасываем форму при открытии модального окна
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm()
    // Блокируем прокрутку body при открытии модалки
    document.body.style.overflow = 'hidden'
  } else {
    // Восстанавливаем прокрутку body при закрытии модалки
    document.body.style.overflow = ''
  }
})

// Очистка при размонтировании компонента
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
