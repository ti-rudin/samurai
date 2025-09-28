<template>
  <div class="max-w-6xl mx-auto p-3 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <section class="mb-6">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
        <div class="p-3 bg-white dark:bg-gray-800 rounded shadow text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer relative">
          <router-link to="/clients" class="block">
            <h2 class="text-lg font-semibold mb-1">Клиенты</h2>
            <p class="text-2xl font-bold">{{ clientsCount }}</p>
          </router-link>
          <button @click="openAddClientModal" class="absolute top-1/2 right-1.5 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div class="p-3 bg-white dark:bg-gray-800 rounded shadow text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer relative">
          <router-link to="/cars" class="block">
            <h2 class="text-lg font-semibold mb-1">Автомобили</h2>
            <p class="text-2xl font-bold">{{ carsCount }}</p>
          </router-link>
          <button @click="openAddCarModal" class="absolute top-1/2 right-1.5 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div class="p-3 bg-white dark:bg-gray-800 rounded shadow text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer relative">
          <router-link to="/orders" class="block">
            <h2 class="text-lg font-semibold mb-1">Заказы</h2>
            <p class="text-2xl font-bold">{{ ordersCount }}</p>
          </router-link>
          <button @click="openAddOrderModal" class="absolute top-1/2 right-1.5 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <router-link to="/financial-report" class="p-3 bg-white dark:bg-gray-800 rounded shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <div class="text-center mb-3">
            <h2 class="text-lg font-semibold mb-1">Отчет</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">за текущую неделю</p>
          </div>

          <!-- Компактные финансовые показатели -->
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-center">
              <div class="text-base font-bold text-green-600 dark:text-green-400">{{ formatCurrency(totalRevenue) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Выручка</div>
            </div>
            <div class="text-center">
              <div class="text-base font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(totalProfit) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Прибыль</div>
            </div>
            <div class="text-center">
              <div class="text-base font-bold text-purple-600 dark:text-purple-400">{{ formatCurrency(totalEarnings) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Исполнители</div>
            </div>
            <div class="text-center">
              <div class="text-base font-bold text-orange-600 dark:text-orange-400">{{ formatCurrency(totalPartsCost) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Запчасти</div>
            </div>
          </div>
        </router-link>

      </div>
    </section>

    <!-- Модальные окна -->
    <ClientCreateModal
      :show-modal="showAddClientModal"
      :editing-client="editingClient"
      @close="closeClientModal"
      @submit="handleClientSubmit"
    />
    <CarCreateModal
      :show-modal="showAddCarModal"
      :editing-car="editingCar"
      :clients="clients"
      @close="closeCarModal"
      @submit="handleCarSubmit"
    />
    <OrderCreateModal
      :show="showAddOrderModal"
      :clients="clients"
      :cars="cars"
      @close="closeOrderModal"
      @create="handleOrderSubmit"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import api from '../api/strapi'
import { useFinancialReport } from '../composables/useFinancialReport'
import { useClientsStore } from '../stores/clients'
import { useCarsStore } from '../stores/cars'
import { useOrdersStore } from '../stores/orders'
import ClientCreateModal from '../components/ClientCreateModal.vue'
import CarCreateModal from '../components/CarCreateModal.vue'
import OrderCreateModal from '../components/OrderCreateModal.vue'

export default {
  name: 'Dashboard',
  components: {
    ClientCreateModal,
    CarCreateModal,
    OrderCreateModal
  },
  setup() {
    const clientsCount = ref(0)
    const carsCount = ref(0)
    const ordersCount = ref(0)
    const isLoading = ref(false)

    // Модальные окна
    const showAddClientModal = ref(false)
    const showAddCarModal = ref(false)
    const showAddOrderModal = ref(false)
    const editingClient = ref(null)
    const editingCar = ref(null)

    // Stores
    const clientsStore = useClientsStore()
    const carsStore = useCarsStore()
    const ordersStore = useOrdersStore()

    // Вычисляемые свойства для модалов
    const clients = computed(() => clientsStore.clients)
    const cars = computed(() => carsStore.cars)

    // Используем composable для финансовых показателей
    const {
      totalRevenue,
      totalEarnings,
      totalPartsCost,
      totalProfit,
      predefinedPeriods,
      setPeriod
    } = useFinancialReport()

    const fetchCounts = async () => {
      try {
        isLoading.value = true

        // Fetch counts for all entities using pagination to get meta.total
        const [clientsResponse, carsResponse, ordersResponse] = await Promise.all([
          api.get('/clients?pagination[pageSize]=1'),
          api.get('/cars?pagination[pageSize]=1'),
          api.get('/orders?pagination[pageSize]=1')
        ])

        clientsCount.value = clientsResponse.data?.meta?.pagination?.total || 0
        carsCount.value = carsResponse.data?.meta?.pagination?.total || 0
        ordersCount.value = ordersResponse.data?.meta?.pagination?.total || 0
      } catch (error) {
        console.error('Ошибка загрузки счетчиков:', error)
        // Set to 0 on error to avoid showing incorrect data
        clientsCount.value = 0
        carsCount.value = 0
        ordersCount.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    // Методы для модальных окон
    const openAddClientModal = () => {
      editingClient.value = null
      showAddClientModal.value = true
    }

    const closeClientModal = () => {
      showAddClientModal.value = false
      editingClient.value = null
    }

    const handleClientSubmit = async (clientData) => {
      try {
        if (clientData.id) {
          await clientsStore.updateClient(clientData.id, clientData)
        } else {
          await clientsStore.addClient(clientData)
        }
        closeClientModal()
        fetchCounts() // Обновляем счетчики
      } catch (error) {
        console.error('Error submitting client:', error)
        alert('Ошибка при сохранении клиента: ' + error.message)
      }
    }

    const openAddCarModal = () => {
      editingCar.value = null
      showAddCarModal.value = true
    }

    const closeCarModal = () => {
      showAddCarModal.value = false
      editingCar.value = null
    }

    const handleCarSubmit = async (carData) => {
      try {
        if (carData.id) {
          await carsStore.updateCar(carData.id, carData)
        } else {
          await carsStore.addCar(carData)
        }
        closeCarModal()
        fetchCounts() // Обновляем счетчики
      } catch (error) {
        console.error('Error submitting car:', error)
        alert('Ошибка при сохранении автомобиля: ' + error.message)
      }
    }

    const openAddOrderModal = () => {
      showAddOrderModal.value = true
    }

    const closeOrderModal = () => {
      showAddOrderModal.value = false
    }

    const handleOrderSubmit = async (orderData) => {
      try {
        await ordersStore.addOrder(orderData)
        closeOrderModal()
        fetchCounts() // Обновляем счетчики
      } catch (error) {
        console.error('Error submitting order:', error)
        alert('Ошибка при создании заказа: ' + error.message)
      }
    }

    onMounted(() => {
      fetchCounts()
      // Загружаем данные для модалов
      clientsStore.fetchClients()
      carsStore.fetchCars()
      // Устанавливаем текущую неделю по умолчанию и загружаем данные
      const currentWeekPeriod = predefinedPeriods.value.find(p => p.key === 'current-week')
      if (currentWeekPeriod) {
        setPeriod(currentWeekPeriod)
      }
    })

    return {
      clientsCount,
      carsCount,
      ordersCount,
      isLoading,
      totalRevenue,
      totalEarnings,
      totalPartsCost,
      totalProfit,
      formatCurrency,
      // Модальные окна
      showAddClientModal,
      showAddCarModal,
      showAddOrderModal,
      editingClient,
      editingCar,
      clients,
      cars,
      openAddClientModal,
      closeClientModal,
      handleClientSubmit,
      openAddCarModal,
      closeCarModal,
      handleCarSubmit,
      openAddOrderModal,
      closeOrderModal,
      handleOrderSubmit,
    }
  },
}
</script>

<style>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
