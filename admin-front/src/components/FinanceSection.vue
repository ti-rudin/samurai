<template>
  <div class="bg-white dark:bg-gray-800 p-4 my-3 rounded-lg shadow-md border-2 border-indigo-500">
    <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Финансы</h2>
    
    <!-- Основной план -->
    <div class="mb-6">
      <h3 class="text-md font-medium mb-3 text-blue-700 dark:text-blue-300 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        Основной план
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
        <div class="text-center">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Работы</div>
          <div class="text-lg font-semibold text-blue-700 dark:text-blue-300">
            {{ formatCurrency(mainWorksCost) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Запчасти</div>
          <div class="text-lg font-semibold text-blue-700 dark:text-blue-300">
            {{ formatCurrency(mainPartsCost) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Итого</div>
          <div class="text-xl font-bold text-blue-800 dark:text-blue-200">
            {{ formatCurrency(mainTotalCost) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Рекомендации -->
    <div>
      <h3 class="text-md font-medium mb-3 text-amber-700 dark:text-amber-300 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Рекомендации
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50 dark:bg-gray-700 p-3 rounded-lg">
        <div class="text-center">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Работы</div>
          <div class="text-lg font-semibold text-amber-700 dark:text-amber-300">
            {{ formatCurrency(recommendedWorksCost) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Запчасти</div>
          <div class="text-lg font-semibold text-amber-700 dark:text-amber-300">
            {{ formatCurrency(recommendedPartsCost) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Итого</div>
          <div class="text-xl font-bold text-amber-800 dark:text-amber-200">
            {{ formatCurrency(recommendedTotalCost) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // Основной план
  mainWorksCost: {
    type: Number,
    default: 0
  },
  mainPartsCost: {
    type: Number,
    default: 0
  },
  mainTotalCost: {
    type: Number,
    default: 0
  },
  // Рекомендации
  recommendedWorksCost: {
    type: Number,
    default: 0
  },
  recommendedPartsCost: {
    type: Number,
    default: 0
  },
  recommendedTotalCost: {
    type: Number,
    default: 0
  }
});

// Форматирование валюты
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};
</script>
