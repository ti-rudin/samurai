<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-gray-200 dark:border-gray-600">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style="min-width: 700px;">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Автомобиль
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Владелец
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Год
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Номер
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Пробег
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Действия
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="car in cars" :key="car.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <!-- Автомобиль -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ car.make }} {{ car.model }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ car.color || 'Цвет не указан' }}
            </div>
          </td>

          <!-- Владелец -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900 dark:text-white">
              {{ getClientName(car.clientId) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ getClientPhone(car.clientId) }}
            </div>
          </td>

          <!-- Год -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ car.year }}
          </td>

          <!-- Номер -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
            {{ car.licensePlate }}
          </td>

          <!-- Пробег -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ car.mileage || 0 }} км
          </td>

          <!-- Действия -->
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button
                @click="editCar(car)"
                class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteCar(car.id)"
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
    <div v-if="!cars || cars.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400">
      <div class="text-lg font-medium">Нет данных об автомобилях</div>
      <div class="text-sm mt-2">Создайте первый автомобиль</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarTable',
  props: {
    cars: {
      type: Array,
      default: () => []
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
      return client ? client.phone : 'Нет телефона'
    }

    const editCar = (car) => {
      emit('edit', car)
    }

    const deleteCar = (carId) => {
      emit('delete', carId)
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
