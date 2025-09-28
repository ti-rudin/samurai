<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-blue-500">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-semibold">Работы</h2>
    </div>

    <!-- Основные работы -->
    <WorkList
      :works="nonRecommendedWorks"
      :executors="props.executors"
      @edit="onEditWork"
      @delete="onDeleteWork"
      @batch-delete="emit('batch-delete', $event)"
      @batch-assign="emit('batch-assign', $event)"
    />

    <div class="flex justify-center">
      <button @click="onAddWork" type="button"
        class="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 text-sm">
        Добавить работу
      </button>
    </div>

    <div v-if="nonRecommendedWorks.length === 0" class="text-center py-4 text-gray-500 hidden">
      Работы не добавлены
    </div>

    <!-- Модальное окно добавления/редактирования работы -->
    <WorkItemModal
      :show="isWorkModalOpen"
      :work="currentWork"
      :executors="executors"
      @save="onSaveWork"
      @close="closeWorkModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import WorkItemModal from './WorkItemModal.vue';
import WorkList from './WorkList.vue';

const props = defineProps({
  works: {
    type: Array,
    default: () => []
  },
  executors: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'add-work',
  'edit-work',
  'delete-work',
  'batch-delete',
  'batch-assign'
]);

const nonRecommendedWorks = computed(() => props.works);
const isWorkModalOpen = ref(false);
const currentWork = ref({});

const onAddWork = () => {
  currentWork.value = {
    name: '',
    description: '',
    cost: 0,
    status: 'pending',
    executor: null,
    isRecomended: false
  };
  isWorkModalOpen.value = true;
};

const onEditWork = (work) => {
  currentWork.value = { ...work };
  isWorkModalOpen.value = true;
};

const onSaveWork = (workData) => {
  console.log('[WorkSection] onSaveWork called with workData:', workData)
  console.log('[WorkSection] workData.id:', workData?.id)
  console.log('[WorkSection] workData type:', typeof workData)
  console.log('[WorkSection] workData.executor:', workData.executor)
  console.log('[WorkSection] workData.executorPercentage:', workData.executorPercentage)

  // Создаем простую копию объекта без использования JSON
  const dataToEmit = { ...workData };

  if (dataToEmit.id) {
    console.log('[WorkSection] Emitting edit-work with:', dataToEmit)
    emit('edit-work', dataToEmit);
  } else {
    console.log('[WorkSection] Emitting add-work with:', dataToEmit)
    emit('add-work', dataToEmit);
  }
  closeWorkModal();
};

const onDeleteWork = (workId) => {
  emit('delete-work', workId);
};

const closeWorkModal = () => {
  isWorkModalOpen.value = false;
  currentWork.value = {};
};
</script>
