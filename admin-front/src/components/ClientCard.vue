<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <!-- Заголовок с именем и действиями -->
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-semibold">{{ client.name }}</h3>
      <div class="flex space-x-2">
        <button
          @click="editClient"
          class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
          title="Редактировать"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="deleteClient"
          class="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
          title="Удалить"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Контакты -->
    <div class="mb-3">
      <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <a :href="'tel:' + client.phone.replace(/[^0-9+]/g, '')"
          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          {{ client.phone }}
        </a>
      </div>



      <!-- Статус -->
      <div class="flex items-center text-sm mb-2">
        <span :class="client.verified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
          {{ client.verified ? 'Проверен' : 'Не проверен' }}
        </span>
      </div>
    </div>

    <!-- Информация об автомобилях -->
    <div class="space-y-2 mb-3 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Автомобили:</span>
        <span class="font-medium">{{ getClientCarCount }} {{ getCarText }}</span>
      </div>

      <div v-if="client.cars && client.cars.length > 0" class="space-y-1">
        <div v-for="car in client.cars" :key="car.id" class="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
          <div class="font-medium">{{ car.make }} {{ car.model }}</div>
          <div class="text-gray-500 dark:text-gray-400">
            {{ car.year }} г., {{ car.licensePlate }}
          </div>
        </div>
      </div>
    </div>

    <!-- Адрес -->
    <div class="mb-3">
      <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ client.address || 'Не указан' }}
      </div>
    </div>

    <!-- Дата регистрации -->
    <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
      <div class="text-gray-600 dark:text-gray-400">
        <strong class="text-gray-700 dark:text-gray-300">Дата регистрации:</strong>
        <span class="ml-2">{{ formatDate(client.registrationDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ClientCard',
  props: {
    client: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  setup(props, { emit }) {
    const getClientCarCount = computed(() => {
      return props.client.cars?.length || 0
    })

    const getCarText = computed(() => {
      const count = getClientCarCount.value
      if (count === 0) return 'автомобилей'
      if (count === 1) return 'автомобиль'
      if (count < 5) return 'автомобиля'
      return 'автомобилей'
    })

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const editClient = () => {
      emit('edit', props.client)
    }

    const deleteClient = () => {
      emit('delete', props.client.id)
    }

    return {
      getClientCarCount,
      getCarText,
      formatDate,
      editClient,
      deleteClient
    }
  }
}
</script>
