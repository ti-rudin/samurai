<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-semibold">Описание работ</h2>
    </div>
    <div>
      <div class="flex items-start gap-2">
        <textarea v-model="description" rows="3"
          class="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
          @input="onDescriptionChange"></textarea>
      </div>
    </div>
    <!-- Кнопка генерации -->
    <div class="flex justify-center mt-3">
      <button @click="onGenerateWorkList" type="button"
        :disabled="loading"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 text-sm font-medium flex items-center gap-2 transition-opacity duration-200"
        :class="{ 'opacity-50 cursor-not-allowed': loading }">
        <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ loading ? 'Генерация...' : 'Сгенерировать список работ' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  description: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:description',
  'generate-work-list'
]);

const description = ref(props.description);

watch(() => props.description, (newValue) => {
  description.value = newValue;
});

const onDescriptionChange = () => {
  emit('update:description', description.value);
};

const onGenerateWorkList = () => {
  emit('generate-work-list');
};
</script>
