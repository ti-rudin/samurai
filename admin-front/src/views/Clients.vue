<template>
  <div class="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-down">
        Клиенты
      </h1>
      <p class="mb-6 text-gray-600 dark:text-gray-300">Управление базой клиентов автосервиса</p>

      <!-- Кнопка создания клиента -->
      <button @click="openAddModal"
        class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Добавить клиента</span>
      </button>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="text-center py-8">
      Загрузка данных...
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="text-center py-8 text-red-500">
      Ошибка загрузки: {{ error }}
    </div>

    <!-- Основной контент -->
    <template v-else>
      <div class="space-y-4">
        <!-- Фильтры -->
        <ClientFilters
          @search="onSearch"
          @reset="onResetFilters"
        />

        <!-- Десктопное представление (таблица) -->
        <div class="hidden md:block">
          <ClientTable
            :clients="filteredClients"
            @edit="editClient"
            @delete="deleteClient"
          />
        </div>

        <!-- Мобильное представление (карточки) -->
        <div class="md:hidden space-y-4">
          <div v-if="!filteredClients || filteredClients.length === 0"
            class="text-center py-12 text-gray-500 dark:text-gray-400">
            <div class="text-lg font-medium">Нет данных о клиентах</div>
            <div class="text-sm mt-2">Попробуйте изменить фильтры или создайте первого клиента</div>
          </div>

          <div v-else>
            <ClientCard
              v-for="client in filteredClients"
              :key="client.id"
              :client="client"
              @edit="editClient"
              @delete="deleteClient"
            />
          </div>
        </div>

        <!-- Статистика для десктопной версии -->
        <div class="hidden md:block mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-lg font-semibold mb-4">Статистика клиентов</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalClients }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Всего клиентов</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ clientsWithCars }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">С автомобилями</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ totalCars }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Всего автомобилей</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ recentClients }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Новые (30 дней)</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модальное окно создания/редактирования клиента -->
    <ClientCreateModal
      :show-modal="showAddModal"
      :editing-client="editingClient"
      @close="closeModal"
      @submit="handleClientSubmit"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useClientsStore } from '../stores/clients'
import { useCarsStore } from '../stores/cars'
import ClientFilters from '../components/ClientFilters.vue'
import ClientTable from '../components/ClientTable.vue'
import ClientCard from '../components/ClientCard.vue'
import ClientCreateModal from '../components/ClientCreateModal.vue'

export default {
  name: 'Clients',
  components: {
    ClientFilters,
    ClientTable,
    ClientCard,
    ClientCreateModal
  },
  setup() {
    const clientsStore = useClientsStore()
    const carsStore = useCarsStore()

    const showAddModal = ref(false)
    const editingClient = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    // Фильтры
    const searchFilters = ref({
      query: ''
    })

    // Вычисляемые свойства
    const clients = computed(() => clientsStore.clients)
    const cars = computed(() => carsStore.cars)

    const filteredClients = computed(() => {
      let filtered = [...clients.value]

      // Фильтр по поисковому запросу
      if (searchFilters.value.query) {
        const query = searchFilters.value.query.toLowerCase()
        filtered = filtered.filter(client => {
          const matchesName = client.name?.toLowerCase().includes(query)
          const matchesPhone = client.phone?.toLowerCase().includes(query)
          const matchesAddress = client.address?.toLowerCase().includes(query)

          return matchesName || matchesPhone || matchesAddress
        })
      }

      // Сортировка по дате создания (новые первыми)
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.registrationDate || 0)
        const dateB = new Date(b.createdAt || b.registrationDate || 0)
        return dateB - dateA
      })

      return filtered
    })

    // Статистика
    const totalClients = computed(() => clients.value.length)

    const clientsWithCars = computed(() => {
      return clients.value.filter(client => client.cars && client.cars.length > 0).length
    })

    const totalCars = computed(() => {
      return clients.value.reduce((sum, client) => {
        return sum + (client.cars?.length || 0)
      }, 0)
    })

    const recentClients = computed(() => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      return clients.value.filter(client => {
        if (!client.registrationDate) return false
        const registrationDate = new Date(client.registrationDate)
        return registrationDate >= thirtyDaysAgo
      }).length
    })

    // Загрузка данных
    const loadData = async () => {
      try {
        isLoading.value = true
        error.value = null
        await Promise.all([
          clientsStore.fetchClients(),
          carsStore.fetchCars()
        ])
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        error.value = err.message || 'Ошибка загрузки данных'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(loadData)

    // Методы
    const openAddModal = () => {
      editingClient.value = null
      showAddModal.value = true
    }

    const closeModal = () => {
      showAddModal.value = false
      editingClient.value = null
    }

    const editClient = (client) => {
      editingClient.value = { ...client }
      showAddModal.value = true
    }

    const deleteClient = async (clientId) => {
      if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
        try {
          await clientsStore.removeClient(clientId)
        } catch (error) {
          alert(error.message || 'Ошибка при удалении клиента')
          console.error('Delete client error:', error)
        }
      }
    }

    const handleClientSubmit = async (clientData) => {
      try {
        if (clientData.id) {
          // Обновление существующего клиента
          await clientsStore.updateClient(clientData.id, clientData)
        } else {
          // Создание нового клиента
          await clientsStore.addClient(clientData)
        }
        closeModal()
      } catch (error) {
        console.error('Error submitting client:', error)
        alert('Ошибка при сохранении клиента: ' + error.message)
      }
    }

    // Методы для фильтров
    const onSearch = (filters) => {
      searchFilters.value = { ...filters }
    }

    const onResetFilters = () => {
      searchFilters.value = {
        query: ''
      }
    }

    return {
      clients,
      cars,
      isLoading,
      error,
      showAddModal,
      editingClient,
      filteredClients,
      totalClients,
      clientsWithCars,
      totalCars,
      recentClients,
      openAddModal,
      closeModal,
      editClient,
      deleteClient,
      handleClientSubmit,
      onSearch,
      onResetFilters
    }
  }
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
