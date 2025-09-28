import { ref, computed, onMounted, watch } from 'vue'
import { useClientStore } from '@/stores/client'

export function useDashboard() {
  const clientStore = useClientStore()

  // Reactive state
  const selectedCarId = ref(null)
  const isRefreshing = ref(false)

  // Вычисляемые свойства
  const clientInfo = computed(() => clientStore.clientInfo)
  const clientCars = computed(() => clientStore.clientCars)
  const clientOrders = computed(() => {
    const orders = clientStore.clientOrders
    return orders
  })

  // Состояние загрузки
  const isLoading = computed(() => clientStore.loading)

  // Выбранный автомобиль
  const selectedCar = computed(() => {
    if (!selectedCarId.value) return null
    return clientCars.value.find(car => car.id === selectedCarId.value)
  })

  // Заказы для выбранного автомобиля
  const selectedCarOrders = computed(() => {
    // Если данные еще загружаются, возвращаем пустой массив
    if (isLoading.value) {
      return []
    }

    // Добавляем дополнительную проверку
    if (clientOrders.value.length === 0) {
      return []
    }

    let filteredOrders = []

    if (!selectedCarId.value) {
      // Если автомобиль не выбран, показываем ВСЕ заказы клиента (кроме 'new')
      filteredOrders = clientOrders.value.filter(order =>
        order && order.orderstatus !== 'new'
      )
    } else {
      // Фильтруем заказы по выбранному автомобилю и статусу
      filteredOrders = clientOrders.value.filter(order => {
        if (!order) return false

        const carId = order.car?.id || order.car

        // Проверяем автомобиль и статус
        const carMatch = carId === selectedCarId.value
        const statusMatch = order.orderstatus !== 'new'

        return carMatch && statusMatch
      })
    }

    // Сортируем по дате создания (новые сначала)
    const sortedOrders = filteredOrders.sort((a, b) => {
      if (!a || !b) return 0
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return sortedOrders || []
  })

  // Отслеживаем изменения selectedCarId и пересчитываем заказы
  watch([selectedCarId, clientOrders], ([newCarId, newOrders]) => {
    // Принудительно пересчитываем selectedCarOrders
    const result = selectedCarOrders.value
  }, { immediate: true })

  // Автоматический выбор автомобиля при загрузке
  watch(clientCars, (newCars) => {
    if (newCars.length === 1 && !selectedCarId.value) {
      // Если один автомобиль, выбираем его автоматически
      selectedCarId.value = newCars[0].id
    }
  }, { immediate: true })

  // Загрузка данных при монтировании
  onMounted(async () => {
    try {
      await clientStore.fetchClientData()
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
  })

  // Функция обновления данных
  const refreshData = async () => {
    isRefreshing.value = true
    try {
      // Сохраняем текущий выбранный автомобиль
      const currentSelectedCarId = selectedCarId.value

      await clientStore.refreshClientData()

      // После обновления данных, если был выбран автомобиль, пытаемся выбрать его снова
      if (currentSelectedCarId) {
        const carExists = clientCars.value.some(car => car.id === currentSelectedCarId)
        if (carExists) {
          selectedCarId.value = currentSelectedCarId
        } else if (clientCars.value.length > 0) {
          // Если сохраненный автомобиль не найден, выбираем первый доступный
          selectedCarId.value = clientCars.value[0].id
        }
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  return {
    clientInfo,
    clientCars,
    clientOrders,
    selectedCarId,
    selectedCar,
    selectedCarOrders,
    isRefreshing,
    refreshData
  }
}
