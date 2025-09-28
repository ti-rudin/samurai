<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-yellow-400">
    <div class="flex justify-between items-center cursor-pointer" @click="toggleCollapse">
      <h2 class="text-lg font-semibold">Рекомендации</h2>
      <span class="text-sm">{{ isCollapsed ? '▼' : '▲' }}</span>
    </div>
    
    <div v-if="!isCollapsed">
      <!-- Рекомендованные работы -->
      <div v-if="recommendedWorks.length > 0" class="mb-4 mt-3">
        <h3 class="text-md font-medium mb-2 text-yellow-700 dark:text-yellow-400">Рекомендованные работы</h3>
        <RecommendedWorkList
          :works="recommendedWorks"
          :executors="executors"
          @add-recommended-work="onAddRecommendedWork"
          @edit-recommended-work="onEditRecommendedWork"
          @delete-recommended-work="onDeleteRecommendedWork"
        />
      </div>

      <!-- Рекомендованные запчасти -->
      <div v-if="recommendedParts.length > 0" class="mt-3">
        <h3 class="text-md font-medium mb-2 text-yellow-700 dark:text-yellow-400">Рекомендованные запчасти</h3>
        <RecommendedPartList
          :parts="recommendedParts"
          @add-recommended-part="onAddRecommendedPart"
          @edit-recommended-part="onEditRecommendedPart"
          @delete-recommended-part="onDeleteRecommendedPart"
        />
      </div>

      <div v-if="recommendedWorks.length === 0 && recommendedParts.length === 0" class="text-center py-4 text-gray-500">
        Рекомендаций нет
      </div>

      <!-- Кнопка "Создать на основании" -->
      <div v-if="recommendedWorks.length > 0 || recommendedParts.length > 0" class="flex justify-center   ">
        <button
          @click="handleCreateOrderFromRecommendations"
          :disabled="loading"
          class="mt-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 dark:hover:bg-yellow-500 disabled:bg-yellow-300 disabled:cursor-not-allowed text-sm flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="loading">Создание заказа...</span>
          <span v-else>Создать на основании</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import RecommendedWorkList from './RecommendedWorkList.vue';
import RecommendedPartList from './RecommendedPartList.vue';

const props = defineProps({
  recommendedWorks: {
    type: Array,
    default: () => []
  },
  recommendedParts: {
    type: Array,
    default: () => []
  },
  executors: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'add-recommended-work',
  'add-recommended-part',
  'edit-recommended-work',
  'delete-recommended-work',
  'edit-recommended-part',
  'delete-recommended-part',
  'create-order-from-recommendations'
]);

const isCollapsed = ref(false);

const onAddRecommendedWork = (work) => {
  emit('add-recommended-work', work);
};

const onEditRecommendedWork = (work) => {
  emit('edit-recommended-work', work);
};

const onDeleteRecommendedWork = (workId) => {
  emit('delete-recommended-work', workId);
};

const onAddRecommendedPart = (part) => {
  emit('add-recommended-part', part);
};

const onEditRecommendedPart = (part) => {
  emit('edit-recommended-part', part);
};

const onDeleteRecommendedPart = (partId) => {
  emit('delete-recommended-part', partId);
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleCreateOrderFromRecommendations = () => {
  emit('create-order-from-recommendations');
};
</script>
