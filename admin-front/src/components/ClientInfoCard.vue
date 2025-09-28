<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Информация о клиенте</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1">
        <p class="text-sm text-gray-500 dark:text-gray-400">Клиент</p>
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {{ client?.name || 'Не выбран' }}
        </p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-500 dark:text-gray-400">Телефон</p>
        <p class="text-sm font-medium">
          <a v-if="client?.phone" :href="`tel:${client.phone}`"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            {{ client.phone }}
          </a>
          <span v-else class="text-gray-500 dark:text-gray-400">Не указан</span>
        </p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-500 dark:text-gray-400">Автомобиль</p>
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {{ car ? `${car.make} ${car.model}, ${car.year} г., ${car.licensePlate || 'без номера'}` : 'Не выбран' }}
        </p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-500 dark:text-gray-400">VIN</p>
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {{ car?.vin || '-' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  client: {
    type: Object,
    required: true,
    default: () => ({})
  },
  car: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
</script>
