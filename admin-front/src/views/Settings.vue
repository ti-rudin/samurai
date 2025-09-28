<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Настройки</h1>

    <div class="space-y-6">
      <!-- Почасовая ставка -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Почасовая ставка</h2>
        <div class="flex items-center space-x-4">
          <label for="hourlyRate" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ставка (руб/час):
          </label>
          <input
            id="hourlyRate"
            type="number"
            v-model.number="settingsStore.hourlyRate"
            min="0"
            step="100"
            class="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Текущая ставка: {{ settingsStore.hourlyRate }} руб/час
        </p>
      </div>

      <!-- Процент исполнителю -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Процент исполнителю</h2>
        <div class="flex items-center space-x-4">
          <label for="executorPercentage" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Процент (%):
          </label>
          <input
            id="executorPercentage"
            type="number"
            v-model.number="settingsStore.executorPercentage"
            min="0"
            max="100"
            step="1"
            class="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Текущий процент: {{ settingsStore.executorPercentage }}%
        </p>
      </div>

      <!-- Заполнение БД тестовыми данными -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Тестовые данные</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Заполнить базу данных тестовыми данными для демонстрации работы сервиса.
          Будет создано 7 клиентов, автомобили и заказы.
        </p>
        <button
          @click="seedDatabase"
          :disabled="isSeeding"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSeeding ? 'Заполнение...' : 'Заполнить БД тестовыми данными' }}
        </button>
        <p v-if="seedMessage" class="text-sm mt-2" :class="seedError ? 'text-red-600' : 'text-green-600'">
          {{ seedMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api/strapi'

export default {
  name: 'Settings',
  setup() {
    const settingsStore = useSettingsStore()
    const isSeeding = ref(false)
    const seedMessage = ref('')
    const seedError = ref(false)

    const clearDatabase = async () => {
      seedMessage.value = 'Очистка базы данных...'

      try {
        // Delete in reverse order of dependencies
        // Delete parts
        const partsResponse = await api.get('/parts?pagination[limit]=1000')
        const parts = partsResponse.data?.data || []
        for (const part of parts) {
          try {
            await api.delete(`/parts/${part.id}`)
          } catch (error) {
            console.warn(`Failed to delete part ${part.id}:`, error.message)
          }
        }

        // Delete works
        const worksResponse = await api.get('/works?pagination[limit]=1000')
        const works = worksResponse.data?.data || []
        for (const work of works) {
          try {
            await api.delete(`/works/${work.id}`)
          } catch (error) {
            console.warn(`Failed to delete work ${work.id}:`, error.message)
          }
        }

        // Delete cars
        const carsResponse = await api.get('/cars?pagination[limit]=1000')
        const cars = carsResponse.data?.data || []
        for (const car of cars) {
          try {
            await api.delete(`/cars/${car.id}`)
          } catch (error) {
            console.warn(`Failed to delete car ${car.id}:`, error.message)
          }
        }

        // Delete orders
        const ordersResponse = await api.get('/orders?pagination[limit]=1000')
        const orders = ordersResponse.data?.data || []
        for (const order of orders) {
          try {
            await api.delete(`/orders/${order.id}`)
          } catch (error) {
            console.warn(`Failed to delete order ${order.id}:`, error.message)
          }
        }

        // Delete clients
        const clientsResponse = await api.get('/clients?pagination[limit]=1000')
        const clients = clientsResponse.data?.data || []
        for (const client of clients) {
          try {
            await api.delete(`/clients/${client.id}`)
          } catch (error) {
            console.warn(`Failed to delete client ${client.id}:`, error.message)
          }
        }

        // Delete users (only authenticated, not admin)
        const usersResponse = await api.get('/users?populate=role&pagination[limit]=1000')
        const users = usersResponse.data || []
        for (const user of users) {
          if (user.role?.name !== 'Administrator') {
            try {
              await api.delete(`/users/${user.id}`)
            } catch (error) {
              console.warn(`Failed to delete user ${user.id}:`, error.message)
            }
          }
        }

      } catch (error) {
        console.warn('Error clearing database:', error)
        // Continue anyway
      }
    }

    const seedDatabase = async () => {
      isSeeding.value = true
      seedMessage.value = ''
      seedError.value = false

      try {
        // Clear database first
        await clearDatabase()

        // Helper function to generate random date
        const randomDate = (start, end) => {
          return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        }

        // Get roles
        const rolesResponse = await api.get('/users-permissions/roles')
        const roles = rolesResponse.data.roles
        const mechanicRole = roles.find(r => r.name === 'mechanic')
        const clientRole = roles.find(r => r.name === 'Clients')

        // Create mechanics (users)
        seedMessage.value = 'Создание механиков...'
        const mechanics = []
        const mechanicNames = ['meh', 'Петр Петров', 'Сидор Сидоров', 'Алексей Алексеев']
        for (const name of mechanicNames) {
          const [firstName, lastName] = name.split(' ')
          try {
              const response = await api.post('/users', {
                username: name.toLowerCase().replace(' ', '_'),
                email: `${firstName.toLowerCase()}@samurai.local`,
                password: 'samurai123',
                confirmed: true,
                blocked: false,
                role: mechanicRole?.id
              })
              mechanics.push(response.data.data || response.data)
          } catch (userError) {
            console.warn(`Failed to create user ${name}:`, userError.message)
            // Create a mock user object for relations
            mechanics.push({
              id: Math.floor(Math.random() * 10000),
              username: name.toLowerCase().replace(' ', '_'),
              email: `${firstName.toLowerCase()}@samurai.local`
            })
          }
        }

        // Create clients
        seedMessage.value = 'Создание клиентов...'
        const clients = []
        const clientData = [
          { name: 'Александр Смирнов', phone: '+7 123 456 7890', address: 'Москва, ул. Ленина 1' },
          { name: 'Мария Иванова', phone: '+7 123 456 7891', address: 'СПб, ул. Невский 2' },
          { name: 'Дмитрий Петров', phone: '+7 123 456 7892', address: 'Екатеринбург, ул. Ленина 3' },
          { name: 'Елена Сидорова', phone: '+7 123 456 7893', address: 'Новосибирск, ул. Красная 4' },
          { name: 'Андрей Кузнецов', phone: '+7 123 456 7894', address: 'Казань, ул. Баумана 5' },
          { name: 'Ольга Попова', phone: '+7 123 456 7895', address: 'Челябинск, ул. Ленина 6' },
          { name: 'Сергей Васильев', phone: '+7 123 456 7896', address: 'Омск, ул. Маркса 7' },
        ]

        for (const data of clientData) {
          const response = await api.post('/clients', {
            data: {
              name: data.name,
              phone: data.phone,
              address: data.address,
              registrationDate: randomDate(new Date(2023, 0, 1), new Date()),
              verified: Math.random() > 0.5
            }
          })
          clients.push(response.data.data)
        }

        // Create user for Sergey Vasilyev
        if (clients.length > 0) {
          const sergeyClient = clients.find(c => c.name === 'Сергей Васильев')
          if (sergeyClient) {
            try {
              const userResponse = await api.post('/users', {
                username: 'client',
                email: 'client@samurai.local',
                password: 'samurai123',
                confirmed: true,
                blocked: false,
                role: clientRole?.id
              })
              const user = userResponse.data.data || userResponse.data
              // Update client with user relation
              await api.put(`/clients/${sergeyClient.id}`, {
                data: {
                  user: user.id
                }
              })
            } catch (userError) {
              console.warn('Failed to create user for Sergey Vasilyev:', userError.message)
            }
          }
        }

        // Create cars
        seedMessage.value = 'Создание автомобилей...'
        const cars = []
        const carMakes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Volkswagen']
        const carModels = ['Camry', 'Civic', 'Focus', 'X5', 'C-Class', 'A4', 'Golf']

        // First two clients get 2 cars each
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const response = await api.post('/cars', {
              data: {
                client: clients[i].id,
                make: carMakes[Math.floor(Math.random() * carMakes.length)],
                model: carModels[Math.floor(Math.random() * carModels.length)],
                year: Math.floor(Math.random() * (2023 - 2010) + 2010),
                vin: `VIN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
                licensePlate: `A${Math.floor(Math.random() * 999)}AA${Math.floor(Math.random() * 99)}`,
                mechanics: [mechanics[Math.floor(Math.random() * mechanics.length)].id]
              }
            })
            // Store car with client reference
            cars.push({
              ...response.data.data,
              clientId: clients[i].id,
              client: clients[i]
            })
          }
        }

        // Other clients get 1 car each
        for (let i = 2; i < clients.length; i++) {
          const response = await api.post('/cars', {
            data: {
              client: clients[i].id,
              make: carMakes[Math.floor(Math.random() * carMakes.length)],
              model: carModels[Math.floor(Math.random() * carModels.length)],
              year: Math.floor(Math.random() * (2023 - 2010) + 2010),
              vin: `VIN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
              licensePlate: `A${Math.floor(Math.random() * 999)}AA${Math.floor(Math.random() * 99)}`,
              mechanics: [mechanics[Math.floor(Math.random() * mechanics.length)].id]
            }
          })
          // Store car with client reference
          cars.push({
            ...response.data.data,
            clientId: clients[i].id,
            client: clients[i]
          })
        }

        // Create orders for each car (2-3 per car)
        seedMessage.value = 'Создание заказов...'
        const orderStatuses = ['new', 'in_progress', 'completed', 'completed', 'completed']
        const workStatuses = ['pending', 'in_progress', 'completed', 'completed', 'completed']
        const partStatuses = ['pending_from_client', 'need_to_order', 'ordered', 'onbase', 'onbase']

        for (const car of cars) {
          const numOrders = Math.floor(Math.random() * 2) + 2 // 2 or 3
          for (let i = 0; i < numOrders; i++) {
            const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
            const orderResponse = await api.post('/orders', {
              data: {
                client: car.client.id,
                car: car.id,
                orderstatus: status,
                description: `Ремонт автомобиля ${car.make} ${car.model}`,
                notes: 'Тестовый заказ',
                estimatedCost: Math.floor(Math.random() * 50000) + 10000,
                finalCost: status === 'completed' ? Math.floor(Math.random() * 50000) + 10000 : null
              }
            })
            const order = orderResponse.data.data

            // Create works for order
            const numWorks = Math.floor(Math.random() * 3) + 1 // 1-3 works
            for (let j = 0; j < numWorks; j++) {
              const workStatus = workStatuses[Math.floor(Math.random() * workStatuses.length)]
              const executor = mechanics[Math.floor(Math.random() * mechanics.length)]
              await api.post('/works', {
                data: {
                  order: order.id,
                  name: `Работа ${j + 1}`,
                  description: `Описание работы ${j + 1}`,
                  cost: Math.floor(Math.random() * 10000) + 1000,
                  status_of_work: workStatus,
                  executor: [executor.id],
                  executorPercentage: Math.floor(Math.random() * 20) + 10,
                  isRecomended: Math.random() > 0.5
                }
              })
            }

            // Create parts for order
            const numParts = Math.floor(Math.random() * 3) + 1 // 1-3 parts
            for (let j = 0; j < numParts; j++) {
              await api.post('/parts', {
                data: {
                  order: order.id,
                  number: `PART${Math.floor(Math.random() * 10000)}`,
                  name: `Запчасть ${j + 1}`,
                  quantity: Math.floor(Math.random() * 5) + 1,
                  price: Math.floor(Math.random() * 5000) + 500,
                  partstatus: partStatuses[Math.floor(Math.random() * partStatuses.length)],
                  isRecomended: Math.random() > 0.5
                }
              })
            }
          }
        }

        seedMessage.value = 'База данных успешно заполнена тестовыми данными!'
      } catch (error) {
        console.error('Error seeding database:', error)
        seedError.value = true
        seedMessage.value = `Ошибка при заполнении: ${error.response?.data?.error?.message || error.message}`
      } finally {
        isSeeding.value = false
      }
    }

    return {
      settingsStore,
      isSeeding,
      seedMessage,
      seedError,
      seedDatabase
    }
  }
}
</script>
