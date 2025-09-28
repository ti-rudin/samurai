<template>
  <div class="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-down">
        Заказ-наряды
      </h1>
      <p class="mb-6 text-gray-600 dark:text-gray-300">Управление заказами на ремонт и обслуживание</p>

      <!-- Кнопка создания заказа -->
      <button @click="openAddModal"
        class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Создать заказ-наряд</span>
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
        <div class="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
          <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <!-- Поле поиска -->
            <div class="flex-1">
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Поиск по заказам
              </label>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по ID заказа, клиенту, автомобилю..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="onSearchInput"
              />
            </div>

            <!-- Фильтр по статусу -->
            <div class="w-full md:w-48">
              <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Статус
              </label>
              <select
                id="status-filter"
                v-model="selectedStatus"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @change="onStatusChange"
              >
                <option value="">Все статусы</option>
                <option value="new">Новый</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            <!-- Фильтр по клиенту -->
            <div class="w-full md:w-48">
              <label for="client-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Клиент
              </label>
              <select
                id="client-filter"
                v-model="selectedClient"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @change="onClientFilterChange"
              >
                <option value="">Все клиенты</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Кнопка сброса фильтров -->
            <div class="w-full md:w-auto">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 opacity-0">
                Действия
              </label>
              <button
                @click="resetFilters"
                class="w-full md:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                :disabled="!hasActiveFilters"
              >
                Сбросить
              </button>
            </div>
          </div>

          <!-- Активные фильтры -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Активные фильтры:</span>

            <span v-if="searchQuery" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Поиск: "{{ searchQuery }}"
              <button @click="clearSearch" class="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                ×
              </button>
            </span>

            <span v-if="selectedStatus" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Статус: {{ getStatusText(selectedStatus) }}
              <button @click="clearStatus" class="ml-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
                ×
              </button>
            </span>

            <span v-if="selectedClient" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Клиент: {{ getClientName(selectedClient) }}
              <button @click="clearClient" class="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                ×
              </button>
            </span>
          </div>
        </div>

        <!-- Десктопное представление (таблица) -->
        <div class="hidden md:block">
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
                      Основные работы и запчасти
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Прогресс
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Рекомендации
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
                  <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <!-- ID заказа -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        #{{ order.id }}
                      </div>
                    </td>

                    <!-- Клиент -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ getOrderClientName(order) }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        <a v-if="order.client?.phone" :href="`tel:${order.client.phone}`"
                          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          {{ order.client.phone }}
                        </a>
                        <span v-else>Нет телефона</span>
                      </div>
                    </td>

                    <!-- Автомобиль -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ getOrderCarName(order) }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ order.car?.licensePlate || 'Без номера' }}
                      </div>
                    </td>

                    <!-- Статус -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getOrderStatusColorClass(order.orderstatus)"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ getOrderStatusText(order.orderstatus) }}
                      </span>
                    </td>

                    <!-- Основные работы и запчасти -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ getOrderTotal(order) }} руб.
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ (order.works?.filter(w => w.isRecomended !== true) || []).length }} работ, {{ (order.parts?.filter(p => p.isRecomended !== true) || []).length }} запчастей
                      </div>
                    </td>

                    <!-- Прогресс -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-col items-center">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ getOrderProgress(order) }}%
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            class="bg-green-600 h-2 rounded-full transition-all duration-300"
                            :style="{ width: `${getOrderProgress(order)}%` }"
                          ></div>
                        </div>
                      </div>
                    </td>

                    <!-- Рекомендации -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ getRecommendedTotal(order) }} руб.
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ getRecommendedWorksTotal(order) > 0 || getRecommendedPartsTotal(order) > 0 ? 'Включая работы и запчасти' : 'Без рекомендаций' }}
                      </div>
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
            <div v-if="!filteredOrders || filteredOrders.length === 0"
              class="text-center py-12 text-gray-500 dark:text-gray-400">
              <div class="text-lg font-medium">Нет данных о заказах</div>
              <div class="text-sm mt-2">Создайте первый заказ-наряд</div>
            </div>
          </div>
        </div>

        <!-- Мобильное представление (карточки) -->
        <div class="md:hidden space-y-4">
          <div v-if="!filteredOrders || filteredOrders.length === 0"
            class="text-center py-12 text-gray-500 dark:text-gray-400">
            <div class="text-lg font-medium">Нет данных о заказах</div>
            <div class="text-sm mt-2">Попробуйте изменить фильтры или создайте первый заказ-наряд</div>
          </div>

          <div v-else>
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600"
            >
              <!-- Заголовок с ID и действиями -->
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold">Заказ #{{ order.id }}</h3>
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
              </div>

              <!-- Информация о статусе -->
              <div class="mb-3">
                <span :class="getOrderStatusColorClass(order.orderstatus)" class="px-2 py-1 rounded text-sm font-medium">
                  {{ getOrderStatusText(order.orderstatus) }}
                </span>
              </div>

              <!-- Информация о клиенте и автомобиле -->
              <div class="space-y-2 mb-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Клиент:</span>
                  <span class="font-medium">{{ getOrderClientName(order) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Автомобиль:</span>
                  <span class="font-medium">{{ getOrderCarName(order) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Гос. номер:</span>
                  <span class="font-medium">{{ order.car?.licensePlate || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Телефон:</span>
                  <a v-if="order.client?.phone" :href="`tel:${order.client.phone}`"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    {{ order.client.phone }}
                  </a>
                  <span v-else class="text-gray-500 dark:text-gray-400">Не указан</span>
                </div>
              </div>

              <!-- Прогресс -->
              <div class="mb-3">
                <div class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Прогресс:</span>
                    <div class="flex flex-col items-end">
                      <span class="font-bold text-lg text-green-600 dark:text-green-400">{{ getOrderProgress(order) }}%</span>
                      <div class="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                        <div
                          class="bg-green-600 h-2 rounded-full transition-all duration-300"
                          :style="{ width: `${getOrderProgress(order)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Финансовый блок -->
              <div class="mt-3 space-y-3">
                <!-- Основной раздел -->
                <div class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Основные работы и запчасти:</span>
                    <span class="font-bold text-lg text-blue-600 dark:text-blue-400">{{ getOrderTotal(order) }} руб.</span>
                  </div>
                </div>

                <!-- Раздел рекомендаций -->
                <div class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Рекомендации:</span>
                    <span class="font-bold text-lg text-blue-600 dark:text-blue-400">{{ getRecommendedTotal(order) }} руб.</span>
                  </div>
                </div>
              </div>

              <!-- Дата создания -->
              <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <div class="text-gray-600 dark:text-gray-400">
                  <strong class="text-gray-700 dark:text-gray-300">Создан:</strong>
                  <span class="ml-2">{{ formatDate(order.createdAt) }}</span>
                </div>
              </div>
            </div>
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
              <div class="text-sm text-gray-600 dark:text-gray-400">Сумма Завершенных</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модальное окно создания заказа -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
          <!-- Header - fixed at top -->
          <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Создать новый заказ
            </h3>
            <button @click="closeModal" class="text-gray-600 hover:text-gray-900 dark:hover:text-white p-1">
              <svg class="w-5 w-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6">
            <form @submit.prevent="createOrder" class="space-y-4">
              <!-- Выбор клиента -->
              <div>
                <label for="client-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Клиент *
                </label>
                <select
                  id="client-select"
                  v-model="formData.clientId"
                  @change="onClientChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="" disabled selected>Выберите клиента</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </select>
              </div>

              <!-- Выбор автомобиля -->
              <div>
                <label for="car-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Автомобиль *
                </label>
                <select
                  id="car-select"
                  v-model="formData.carId"
                  :disabled="!formData.clientId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
                  required
                >
                  <option v-if="!formData.clientId" value="" disabled selected>
                    Сначала выберите клиента
                  </option>
                  <option v-else-if="filteredCars.length === 0" value="" disabled>
                    У клиента нет автомобилей
                  </option>
                  <option v-else value="" disabled selected>
                    Выберите автомобиль
                  </option>
                  <option v-for="car in filteredCars" :key="car.id" :value="car.id">
                    {{ car.displayName }}
                  </option>
                </select>
                <p v-if="!formData.clientId" class="text-xs text-gray-500 mt-1">
                  Заполните сначала поле "Клиент", чтобы выбрать автомобиль
                </p>
              </div>

              <!-- Описание работ -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Описание работ
                </label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  rows="3"
                  placeholder="Опишите работы, которые необходимо выполнить..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>

              <!-- Примечания -->
              <div>
                <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Примечания
                </label>
                <textarea
                  id="notes"
                  v-model="formData.notes"
                  rows="2"
                  placeholder="Дополнительные примечания..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Footer with buttons - fixed at bottom -->
          <div class="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              type="submit"
              @click="createOrder"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Создание...' : 'Создать заказ' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '../stores/orders'
import { useClientsStore } from '../stores/clients'
import { useCarsStore } from '../stores/cars'


export default {
  name: 'Orders',
  setup() {
    const router = useRouter()
    const ordersStore = useOrdersStore()
    const clientsStore = useClientsStore()
    const carsStore = useCarsStore()

    const { orders } = storeToRefs(ordersStore)
    const { clients } = storeToRefs(clientsStore)
    const { cars } = storeToRefs(carsStore)

    const showAddModal = ref(false)
    const isLoading = ref(false)
    const error = ref(null)

    // Реактивные данные для OrderList
    const searchFilters = ref({
      query: '',
      status: '',
      clientId: ''
    })

    // Реактивные данные для OrderCreateModal
    const isSubmitting = ref(false)
    const formData = ref({
      clientId: '',
      carId: '',
      description: '',
      notes: ''
    })

    // Реактивные данные для OrderFilters
    const searchQuery = ref('')
    const selectedStatus = ref('')
    const selectedClient = ref('')

    // Вычисляемые свойства для OrderList
    const filteredOrders = computed(() => {
      let filtered = [...orders.value]

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

    const totalOrders = computed(() => orders.value.length)

    const newOrders = computed(() => {
      return orders.value.filter(order => order.orderstatus === 'new').length
    })

    const completedOrders = computed(() => {
      return orders.value.filter(order => order.orderstatus === 'completed').length
    })

    const totalRevenue = computed(() => {
      return orders.value
        .filter(order => order.orderstatus === 'completed')
        .reduce((sum, order) => {
          return sum + getOrderTotal(order)
        }, 0)
    })

    // Вычисляемые свойства для OrderCreateModal
    const filteredCars = computed(() => {
      if (!formData.value.clientId) return []

      return cars.value
        .filter(car => car.clientId === formData.value.clientId)
        .map(car => ({
          ...car,
          displayName: `${car.make} ${car.model} (${car.year}) - ${car.licensePlate || 'без номера'}`
        }))
    })

    // Вычисляемые свойства для OrderFilters
    const hasActiveFilters = computed(() => {
      return searchQuery.value || selectedStatus.value || selectedClient.value
    })

    // Загрузка данных
    const loadData = async () => {
      try {
        isLoading.value = true
        error.value = null
        await Promise.all([
          clientsStore.fetchClients(),
          carsStore.fetchCars(),
          ordersStore.fetchOrders()
        ])
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        error.value = err.message || 'Ошибка загрузки данных'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(loadData)

    // Очистка при размонтировании компонента
    onUnmounted(() => {
      document.body.style.overflow = ''
    })

    // Методы
    const openAddModal = () => {
      showAddModal.value = true
    }

    const editOrder = (order) => {
      router.push({ name: 'order-edit', params: { id: order.id } })
    }

    const deleteOrder = async (orderId) => {
      if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        try {
          await ordersStore.removeOrder(orderId)
        } catch (error) {
          alert(error.message || 'Ошибка при удалении заказа')
          console.error('Delete order error:', error)
        }
      }
    }

    const createNewOrder = async (orderData) => {
      try {
        await ordersStore.addOrder(orderData)
        showAddModal.value = false
      } catch (error) {
        console.error('Error creating order:', error)
        alert('Ошибка при создании заказа: ' + error.message)
      }
    }

    // Методы для OrderList
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

    // Методы для OrderCreateModal
    const onClientChange = () => {
      // Сбрасываем выбранный автомобиль при изменении клиента
      formData.value.carId = ''
    }

    const createOrder = async () => {
      if (!formData.value.clientId || !formData.value.carId) {
        return
      }

      isSubmitting.value = true

      try {
        const orderData = {
          clientId: formData.value.clientId,
          carId: formData.value.carId,
          description: formData.value.description,
          notes: formData.value.notes,
          orderstatus: 'new',
          estimatedCost: 0,
          finalCost: 0,
          mechanics: []
        }

        await createNewOrder(orderData)
        closeModal()
      } catch (error) {
        console.error('Ошибка при создании заказа:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      resetForm()
    }

    const resetForm = () => {
      formData.value = {
        clientId: '',
        carId: '',
        description: '',
        notes: ''
      }
    }

    // Сбрасываем форму при открытии модального окна
    watch(() => showAddModal.value, (newValue) => {
      if (newValue) {
        resetForm()
        // Блокируем прокрутку body при открытии модалки
        document.body.style.overflow = 'hidden'
      } else {
        // Восстанавливаем прокрутку body при закрытии модалки
        document.body.style.overflow = ''
      }
    })

    // Методы для OrderFilters
    const onSearchInput = () => {
      onSearch({
        query: searchQuery.value,
        status: selectedStatus.value,
        clientId: selectedClient.value
      })
    }

    const onStatusChange = () => {
      onFilter({
        query: searchQuery.value,
        status: selectedStatus.value,
        clientId: selectedClient.value
      })
    }

    const onClientFilterChange = () => {
      onFilter({
        query: searchQuery.value,
        status: selectedStatus.value,
        clientId: selectedClient.value
      })
    }

    const resetFilters = () => {
      searchQuery.value = ''
      selectedStatus.value = ''
      selectedClient.value = ''
      onResetFilters()
    }

    const clearSearch = () => {
      searchQuery.value = ''
      onSearch({
        query: '',
        status: selectedStatus.value,
        clientId: selectedClient.value
      })
    }

    const clearStatus = () => {
      selectedStatus.value = ''
      onFilter({
        query: searchQuery.value,
        status: '',
        clientId: selectedClient.value
      })
    }

    const clearClient = () => {
      selectedClient.value = ''
      onFilter({
        query: searchQuery.value,
        status: selectedStatus.value,
        clientId: ''
      })
    }

    const getStatusText = (status) => {
      const statusMap = {
        'new': 'Новый',
        'in_progress': 'В работе',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
      }
      return statusMap[status] || status
    }

    const getClientName = (clientId) => {
      const client = clients.value.find(c => c.id === clientId)
      return client ? client.name : 'Неизвестный клиент'
    }

    // Методы для OrderTable
    const getClientNameFromOrder = (order) => {
      return order.client?.name || 'Неизвестный клиент'
    }

    const getCarName = (order) => {
      if (!order.car) return 'Не указан'
      return `${order.car.make || ''} ${order.car.model || ''}`.trim() || 'Не указан'
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

    // Методы для OrderCard
    const getOrderClientName = (order) => {
      return order.client?.name || 'Неизвестный клиент'
    }

    const getOrderCarName = (order) => {
      if (!order.car) return 'Не указан'
      return `${order.car.make || ''} ${order.car.model || ''}`.trim() || 'Не указан'
    }

    const getOrderWorksTotal = (order) => {
      // Only count non-recommended works for basic total
      if (!order.works || order.works.length === 0) return 0
      const basicWorks = order.works.filter(work => work.isRecomended !== true)
      return basicWorks.reduce((sum, work) => sum + (work.cost || 0), 0)
    }



    const getOrderProgress = (order) => {
      if (!order.works || order.works.length === 0) return 0

      // Фильтруем только основные работы (не рекомендованные)
      const basicWorks = order.works.filter(work => work.isRecomended !== true)

      if (basicWorks.length === 0) return 0

      // Рассчитываем сумму стоимостей основных работ
      const totalBasicWorksCost = basicWorks.reduce((sum, work) => sum + (work.cost || 0), 0)

      if (totalBasicWorksCost === 0) return 0

      // Рассчитываем сумму стоимостей завершенных основных работ
      const completedBasicWorksCost = basicWorks
        .filter(work => work.status_of_work === 'completed')
        .reduce((sum, work) => sum + (work.cost || 0), 0)

      // Рассчитываем прогресс в процентах
      const progress = Math.round((completedBasicWorksCost / totalBasicWorksCost) * 100)

      return Math.min(progress, 100) // Ограничиваем максимум 100%
    }

    const getOrderTotal = (order) => {
      const worksTotal = getOrderWorksTotal(order)
      const partsTotal = getOrderPartsTotal(order)
      return worksTotal + partsTotal
    }

    const getRecommendedPartsTotal = (order) => {
      // Recommended parts are in the parts array with isRecomended: true
      if (!order.parts || order.parts.length === 0) return 0
      const recommendedParts = order.parts.filter(part => part.isRecomended === true)
      return recommendedParts.reduce((sum, part) => {
        // For parts, the cost is stored in 'price' and we need to multiply by quantity
        const quantity = part.quantity || 1
        return sum + (part.price || 0) * quantity
      }, 0)
    }

    const getOrderPartsTotal = (order) => {
      // Only count non-recommended parts for basic total
      if (!order.parts || order.parts.length === 0) return 0
      const basicParts = order.parts.filter(part => part.isRecomended !== true)
      return basicParts.reduce((sum, part) => {
        // For parts, the cost is stored in 'price' and we need to multiply by quantity
        const quantity = part.quantity || 1
        return sum + (part.price || 0) * quantity
      }, 0)
    }

    const getRecommendedWorksTotal = (order) => {
      // Recommended works are in the works array with isRecomended: true
      if (!order.works || order.works.length === 0) return 0
      const recommendedWorks = order.works.filter(work => work.isRecomended === true)
      return recommendedWorks.reduce((sum, work) => sum + (work.cost || 0), 0)
    }

    const getRecommendedTotal = (order) => {
      const partsTotal = getRecommendedPartsTotal(order)
      const worksTotal = getRecommendedWorksTotal(order)
      return partsTotal + worksTotal
    }

    const getOrderStatusText = (status) => {
      const statusMap = {
        'new': 'Новый',
        'in_progress': 'В работе',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
      }
      return statusMap[status] || status || 'Неизвестен'
    }

    const getOrderStatusColorClass = (status) => {
      const colorMap = {
        'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }
      return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }

    const getWorkStatusColorClass = (status) => {
      const colorMap = {
        'pending': 'text-yellow-600 dark:text-yellow-400',
        'in_progress': 'text-blue-600 dark:text-blue-400',
        'completed': 'text-green-600 dark:text-green-400'
      }
      return colorMap[status] || 'text-gray-500'
    }

    const getWorkStatusText = (status) => {
      const textMap = {
        'pending': 'Ожидает',
        'in_progress': 'В работе',
        'completed': 'Завершена'
      }
      return textMap[status] || status
    }

    // Функция getExecutorName не нужна на странице заказов

    return {
      orders,
      clients,
      cars,
      isLoading,
      error,
      showAddModal,
      openAddModal,
      editOrder,
      deleteOrder,
      createNewOrder,
      // OrderList data
      searchFilters,
      filteredOrders,
      totalOrders,
      newOrders,
      completedOrders,
      totalRevenue,
      onFilter,
      onSearch,
      onResetFilters,
      // OrderCreateModal data
      isSubmitting,
      formData,
      filteredCars,
      onClientChange,
      createOrder,
      closeModal,
      resetForm,
      // OrderFilters data
      searchQuery,
      selectedStatus,
      selectedClient,
      hasActiveFilters,
      onSearchInput,
      onStatusChange,
      onClientFilterChange,
      resetFilters,
      clearSearch,
      clearStatus,
      clearClient,
      getStatusText,
      getClientName,
      // OrderTable methods
      getClientNameFromOrder,
      getCarName,
      getStatusColorClass,
      calculateTotal,
      formatDate,
      // OrderCard methods
      getOrderClientName,
      getOrderCarName,
      getOrderWorksTotal,
      getOrderPartsTotal,
      getOrderProgress,
      getOrderTotal,
      getRecommendedPartsTotal,
      getRecommendedWorksTotal,
      getRecommendedTotal,
      getOrderStatusText,
      getOrderStatusColorClass,
      getWorkStatusColorClass,
      getWorkStatusText,
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
