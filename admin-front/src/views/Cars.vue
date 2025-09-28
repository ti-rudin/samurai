<template>
  <div class="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-down">
        Автомобили
      </h1>
      <p class="mb-6 text-gray-600 dark:text-gray-300">Управление автомобилями клиентов</p>

      <!-- Кнопка создания автомобиля -->
      <button @click="openAddModal"
        class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Добавить автомобиль</span>
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
        <CarFilters
          :clients="clients"
          @search="onFilterChange"
          @filter="onFilterChange"
          @reset="onResetFilters"
        />

        <!-- Десктопное представление (таблица) -->
        <div class="hidden md:block">
          <CarTable
            :cars="filteredCars"
            :clients="clients"
            @edit="editCar"
            @delete="deleteCar"
          />
        </div>

        <!-- Мобильное представление (карточки) -->
        <div class="md:hidden space-y-4">
          <div v-if="!filteredCars || filteredCars.length === 0"
            class="text-center py-12 text-gray-500 dark:text-gray-400">
            <div class="text-lg font-medium">Нет данных об автомобилях</div>
            <div class="text-sm mt-2">Попробуйте изменить фильтры или создайте первый автомобиль</div>
          </div>

          <div v-else>
            <CarCard
              v-for="car in filteredCars"
              :key="car.id"
              :car="car"
              :clients="clients"
              @edit="editCar"
              @delete="deleteCar"
            />
          </div>
        </div>

        <!-- Статистика для десктопной версии -->
        <div class="hidden md:block mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-lg font-semibold mb-4">Статистика автомобилей</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalCars }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Всего автомобилей</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ carsWithMileage }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">С пробегом</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ averageYear }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Средний год</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ uniqueMakes }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Марок</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модальное окно создания/редактирования автомобиля -->
    <CarCreateModal
      :show-modal="showAddModal"
      :editing-car="editingCar"
      :clients="clients"
      @close="closeModal"
      @submit="handleCarSubmit"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useCarsStore } from '../stores/cars'
import { useClientsStore } from '../stores/clients'
import CarFilters from '../components/CarFilters.vue'
import CarTable from '../components/CarTable.vue'
import CarCard from '../components/CarCard.vue'
import CarCreateModal from '../components/CarCreateModal.vue'

export default {
  name: 'Cars',
  components: {
    CarFilters,
    CarTable,
    CarCard,
    CarCreateModal
  },
  setup() {
    const carsStore = useCarsStore()
    const clientsStore = useClientsStore()

    const showAddModal = ref(false)
    const editingCar = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    // Фильтры
    const searchFilters = ref({
      query: '',
      clientId: ''
    })

    // Вычисляемые свойства
    const cars = computed(() => carsStore.cars)
    const clients = computed(() => clientsStore.clients)

    const filteredCars = computed(() => {
      let filtered = [...cars.value]

      // Фильтр по поисковому запросу
      if (searchFilters.value.query) {
        const query = searchFilters.value.query.toLowerCase()
        filtered = filtered.filter(car => {
          const matchesMake = car.make?.toLowerCase().includes(query)
          const matchesModel = car.model?.toLowerCase().includes(query)
          const matchesLicensePlate = car.licensePlate?.toLowerCase().includes(query)
          const matchesVin = car.vin?.toLowerCase().includes(query)

          return matchesMake || matchesModel || matchesLicensePlate || matchesVin
        })
      }

      // Фильтр по владельцу
      if (searchFilters.value.clientId) {
        filtered = filtered.filter(car => car.clientId === searchFilters.value.clientId)
      }

      // Сортировка по дате создания (новые первыми)
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })

      return filtered
    })

    // Статистика
    const totalCars = computed(() => cars.value.length)

    const carsWithMileage = computed(() => {
      return cars.value.filter(car => car.mileage && car.mileage > 0).length
    })

    const averageYear = computed(() => {
      if (cars.value.length === 0) return 0
      const total = cars.value.reduce((sum, car) => sum + (car.year || 0), 0)
      return Math.round(total / cars.value.length)
    })

    const uniqueMakes = computed(() => {
      const makes = new Set(cars.value.map(car => car.make).filter(Boolean))
      return makes.size
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
      editingCar.value = null
      showAddModal.value = true
    }

    const closeModal = () => {
      showAddModal.value = false
      editingCar.value = null
    }

    const editCar = (car) => {
      editingCar.value = { ...car }
      showAddModal.value = true
    }

    const deleteCar = async (carId) => {
      if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
        try {
          await carsStore.removeCar(carId)
        } catch (error) {
          alert(error.message || 'Ошибка при удалении автомобиля')
          console.error('Delete car error:', error)
        }
      }
    }

    const handleCarSubmit = async (carData) => {
      try {
        if (carData.id) {
          // Обновление существующего автомобиля
          await carsStore.updateCar(carData.id, carData)
        } else {
          // Создание нового автомобиля
          await carsStore.addCar(carData)
        }
        closeModal()
      } catch (error) {
        console.error('Error submitting car:', error)
        alert('Ошибка при сохранении автомобиля: ' + error.message)
      }
    }

    // Методы для фильтров
    const onFilterChange = (filters) => {
      searchFilters.value = { ...filters }
    }

    const onResetFilters = () => {
      searchFilters.value = {
        query: '',
        clientId: ''
      }
    }

    return {
      cars,
      clients,
      isLoading,
      error,
      showAddModal,
      editingCar,
      filteredCars,
      totalCars,
      carsWithMileage,
      averageYear,
      uniqueMakes,
      openAddModal,
      closeModal,
      editCar,
      deleteCar,
      handleCarSubmit,
      onFilterChange,
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
