<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <!-- Заголовок с автомобилем и действиями -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-lg font-semibold">{{ car.make }} {{ car.model }}</h3>
        <div class="text-sm text-gray-600 dark:text-gray-300">{{ car.year }} г.</div>
      </div>
      <div class="flex space-x-2">
        <button
          @click="editCar"
          class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
          title="Редактировать"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="deleteCar"
          class="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
          title="Удалить"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Номер автомобиля -->
    <div class="mb-3">
      <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 01-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="font-medium">{{ car.licensePlate }}</span>
      </div>
    </div>

    <!-- Владелец -->
    <div class="space-y-2 mb-3 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Владелец:</span>
        <span class="font-medium">{{ getClientName(car.clientId) }}</span>
      </div>

      <div v-if="getClientPhone(car.clientId)" class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Телефон:</span>
        <a :href="'tel:' + getClientPhone(car.clientId)"
          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          {{ getClientPhone(car.clientId) }}
        </a>
      </div>
    </div>

    <!-- Характеристики автомобиля -->
    <div class="space-y-2 mb-3 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Цвет:</span>
        <span class="font-medium">{{ car.color || 'Не указан' }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Пробег:</span>
        <span class="font-medium">{{ car.mileage || 0 }} км</span>
      </div>

      <div v-if="car.vin" class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">VIN:</span>
        <span class="font-medium text-xs">{{ car.vin }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarCard',
  props: {
    car: {
      type: Object,
      required: true
    },
    clients: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit', 'delete'],
  setup(props, { emit }) {
    const getClientName = (clientId) => {
      const client = props.clients.find(c => c.id === clientId)
      return client ? client.name : 'Неизвестный клиент'
    }

    const getClientPhone = (clientId) => {
      const client = props.clients.find(c => c.id === clientId)
      return client ? client.phone : null
    }

    const editCar = () => {
      emit('edit', props.car)
    }

    const deleteCar = () => {
      emit('delete', props.car.id)
    }

    return {
      getClientName,
      getClientPhone,
      editCar,
      deleteCar
    }
  }
}
</script>
