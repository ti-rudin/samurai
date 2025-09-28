<template>
  <div class="space-y-4">
    <!-- Фильтры -->
    <OrderFilters
      :clients="clients"
      @filter="onFilter"
      @search="onSearch"
      @reset="onResetFilters"
      ref="filtersRef"
    />

    <!-- Десктопное представление (таблица) -->
    <div class="hidden md:block">
      <OrderTable
        :orders="filteredOrders"
        @edit="editOrder"
        @delete="deleteOrder"
      />
    </div>

    <!-- Мобильное представление (карточки) -->
    <div class="md:hidden space-y-4">
      <div v-if="!filteredOrders || filteredOrders.length === 0"
        class="text-center py-12 text-gray-500 dark:text-gray-400">
        <div class="text-lg font-medium">Нет данных о заказах</div>
        <div class="text-sm mt-2">Попробуйте изменить фильтры или создайте первый заказ-наряд</div>
      </div>

      <div v-else>
        <OrderCard
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
          :is-expanded="expandedOrder === order.id"
          @edit="editOrder"
          @delete="deleteOrder"
          @toggle="toggleOrderExpansion"
        />
      </div>
    </div>

    <!-- Статистика для десктопной версии -->
    <div class="hidden md:block mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
      <h3 class="text-lg font-semibold mb-4">Статистика заказов</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalOrders }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Всего заказов</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ newOrders }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Новых</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ completedOrders }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Завершенных</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ totalRevenue }} руб.</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Общая сумма</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import OrderFilters from './OrderFilters.vue'
import OrderTable from './OrderTable.vue'
import OrderCard from './OrderCard.vue'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  clients: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

// Реактивные данные
const expandedOrder = ref(null)
const filtersRef = ref(null)
const searchFilters = ref({
  query: '',
  status: '',
  clientId: ''
})

// Вычисляемые свойства
const filteredOrders = computed(() => {
  let filtered = [...props.orders]

  // Фильтр по поисковому запросу
  if (searchFilters.value.query) {
    const query = searchFilters.value.query.toLowerCase()
    filtered = filtered.filter(order => {
      const matchesId = order.id.toString().includes(query)
      const matchesClient = order.client?.name?.toLowerCase().includes(query)
      const matchesCar = `${order.car?.make || ''} ${order.car?.model || ''}`.toLowerCase().includes(query)
      const matchesLicensePlate = order.car?.licensePlate?.toLowerCase().includes(query)

      return matchesId || matchesClient || matchesCar || matchesLicensePlate
    })
  }

  // Фильтр по статусу
  if (searchFilters.value.status) {
    filtered = filtered.filter(order => order.orderstatus === searchFilters.value.status)
  }

  // Фильтр по клиенту
  if (searchFilters.value.clientId) {
    filtered = filtered.filter(order => order.client?.id === searchFilters.value.clientId)
  }

  return filtered
})

const totalOrders = computed(() => props.orders.length)

const newOrders = computed(() => {
  return props.orders.filter(order => order.orderstatus === 'new').length
})

const completedOrders = computed(() => {
  return props.orders.filter(order => order.orderstatus === 'completed').length
})

const totalRevenue = computed(() => {
  return props.orders.reduce((sum, order) => {
    const orderTotal = (order.works || []).reduce((workSum, work) => workSum + (work.cost || 0), 0)
    return sum + orderTotal
  }, 0)
})

// Методы
const editOrder = (order) => {
  emit('edit', order)
}

const deleteOrder = (orderId) => {
  emit('delete', orderId)
}

const toggleOrderExpansion = (orderId) => {
  expandedOrder.value = expandedOrder.value === orderId ? null : orderId
}

const onFilter = (filters) => {
  searchFilters.value = { ...filters }
}

const onSearch = (filters) => {
  searchFilters.value = { ...filters }
}

const onResetFilters = () => {
  searchFilters.value = {
    query: '',
    status: '',
    clientId: ''
  }
}

// Сброс развернутых карточек при изменении фильтров
watch(filteredOrders, () => {
  expandedOrder.value = null
})
</script>
