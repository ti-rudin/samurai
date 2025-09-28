<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-green-500">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-semibold">Запчасти</h2>
    </div>

    <!-- Используемые запчасти -->
    <PartList
      :parts="usedParts"
      @edit="onEditPart"
      @delete="onDeletePart"
      @batch-delete="emit('batch-delete', $event)"
    />

    <div class="flex justify-center">
      <button @click="onAddPart" type="button"
        class="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:hover:bg-green-500 text-sm">
        Добавить запчасть
      </button>
    </div>

    <!-- Убрана надпись о том, что запчасти не добавлены -->
    
    <!-- Модальное окно добавления/редактирования запчасти -->
    <PartItemModal
      :show="isPartModalOpen"
      :part="currentPart"
      @save="onSavePart"
      @close="closePartModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getPartStatusText } from '../utils/orderCalculations';
import PartItemModal from './PartItemModal.vue';
import PartList from './PartList.vue';

const props = defineProps({
  parts: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'add-part',
  'edit-part',
  'delete-part',
  'batch-delete'
]);

const usedParts = computed(() => props.parts);
const isPartModalOpen = ref(false);
const currentPart = ref({});

const onAddPart = () => {
  currentPart.value = {
    number: '',
    name: '',
    quantity: 1,
    price: 0,
    partstatus: 'pending_from_client',
    isRecomended: false
  };
  isPartModalOpen.value = true;
};

const onEditPart = (part) => {
  currentPart.value = { ...part };
  isPartModalOpen.value = true;
};

const onSavePart = (partData) => {
  if (partData.id) {
    emit('edit-part', partData);
  } else {
    emit('add-part', partData);
  }
  closePartModal();
};

const onDeletePart = (partId) => {
  emit('delete-part', partId);
};

const closePartModal = () => {
  isPartModalOpen.value = false;
  currentPart.value = {};
};
</script>

