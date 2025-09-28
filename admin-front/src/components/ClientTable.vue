<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-gray-200 dark:border-gray-600">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style="min-width: 800px;">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Клиент
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Контакты
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Статус
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Автомобили
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Адрес
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Регистрация
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Действия
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <!-- Имя клиента -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ client.name }}
            </div>
          </td>

          <!-- Контакты -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900 dark:text-white">
              <a :href="'tel:' + client.phone.replace(/[^0-9+]/g, '')" class="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ client.phone }}
              </a>
            </div>
          </td>

          <!-- Статус -->
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="client.verified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
              {{ client.verified ? 'Проверен' : 'Не проверен' }}
            </span>
          </td>

          <!-- Автомобили -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900 dark:text-white">
              {{ getClientCarCount(client) }} {{ getCarText(getClientCarCount(client)) }}
            </div>
            <div v-if="getClientCarCount(client) > 0" class="text-sm text-gray-500 dark:text-gray-400">
              {{ getClientCarSummary(client) }}
            </div>
          </td>

          <!-- Адрес -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ client.address || 'Не указан' }}
            </div>
          </td>

          <!-- Дата регистрации -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(client.registrationDate) }}
          </td>

          <!-- Действия -->
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button
                @click="editClient(client)"
                class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteClient(client.id)"
                class="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Удалить"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <!-- Сообщение о пустом списке -->
    <div v-if="!clients || clients.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400">
      <div class="text-lg font-medium">Нет данных о клиентах</div>
      <div class="text-sm mt-2">Создайте первого клиента</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientTable',
  props: {
    clients: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit', 'delete'],
  setup(props, { emit }) {
    const getClientCarCount = (client) => {
      return client.cars?.length || 0
    }

    const getCarText = (count) => {
      if (count === 0) return 'автомобилей'
      if (count === 1) return 'автомобиль'
      if (count < 5) return 'автомобиля'
      return 'автомобилей'
    }

    const getClientCarSummary = (client) => {
      if (!client.cars || client.cars.length === 0) return 'Нет автомобилей'

      if (client.cars.length === 1) {
        const car = client.cars[0]
        return `${car.make} ${car.model} (${car.year})`
      }

      // Multiple cars - show first car and count
      const firstCar = client.cars[0]
      const remainingCount = client.cars.length - 1
      return `${firstCar.make} ${firstCar.model} (+${remainingCount})`
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const editClient = (client) => {
      emit('edit', client)
    }

    const deleteClient = (clientId) => {
      emit('delete', clientId)
    }

    return {
      getClientCarCount,
      getCarText,
      getClientCarSummary,
      formatDate,
      editClient,
      deleteClient
    }
  }
}
</script>
