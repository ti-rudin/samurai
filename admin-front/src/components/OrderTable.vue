<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-gray-200 dark:border-gray-600">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style="min-width: 900px;">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Заказ
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Клиент
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Автомобиль
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Статус
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Работы
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Сумма
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Дата
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Действия
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <!-- ID заказа -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              #{{ order.id }}
            </div>
          </td>

          <!-- Клиент -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900 dark:text-white">
              {{ getClientName(order) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ order.client?.phone || 'Нет телефона' }}
            </div>
          </td>

          <!-- Автомобиль -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900 dark:text-white">
              {{ getCarName(order) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ order.car?.licensePlate || 'Без номера' }}
            </div>
          </td>

          <!-- Статус -->
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="getStatusColorClass(order.orderstatus)"
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
              {{ getStatusText(order.orderstatus) }}
            </span>
          </td>

          <!-- Количество работ -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ order.works?.length || 0 }}
          </td>

          <!-- Сумма работ -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
            {{ calculateTotal(order.works) }} руб.
          </td>

          <!-- Дата создания -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(order.createdAt) }}
          </td>

          <!-- Действия -->
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button
                @click="editOrder(order)"
                class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteOrder(order.id)"
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
    <div v-if="!orders || orders.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400">
      <div class="text-lg font-medium">Нет данных о заказах</div>
      <div class="text-sm mt-2">Создайте первый заказ-наряд</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const router = useRouter()

// Методы
const editOrder = (order) => {
  router.push({ name: 'order-edit', params: { id: order.id } })
}

const deleteOrder = (orderId) => {
  emit('delete', orderId)
}

const getClientName = (order) => {
  return order.client?.name || 'Неизвестный клиент'
}

const getCarName = (order) => {
  if (!order.car) return 'Не указан'
  return `${order.car.make || ''} ${order.car.model || ''}`.trim() || 'Не указан'
}

const getStatusText = (status) => {
  const statusMap = {
    'new': 'Новый',
    'in_progress': 'В работе',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  }
  return statusMap[status] || status || 'Неизвестен'
}

const getStatusColorClass = (status) => {
  const colorMap = {
    'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const calculateTotal = (works) => {
  if (!works || works.length === 0) return 0
  return works.reduce((sum, work) => sum + (work.cost || 0), 0)
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
</script>
