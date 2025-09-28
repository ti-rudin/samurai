<template>
  <div>
    <!-- Панель массовых операций -->
    <div v-if="selectedWorks.length > 0" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">
          Выбрано работ: {{ selectedWorks.length }}
        </span>
        <div class="flex space-x-2">
          <button
            @click="openBatchAssignModal"
            class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Назначить исполнителя
          </button>
          <button
            @click="confirmBatchDelete"
            class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Десктопное представление (таблица) -->
    <div class="hidden md:block">
      <WorkTable
        :works="works"
        :executors="executors"
        :selected-works="selectedWorks"
        @edit="editWork"
        @delete="removeWork"
        @batch-delete="handleBatchDelete"
        @batch-assign="handleBatchAssign"
        @toggle-select="toggleSelect"
        @toggle-select-all="toggleSelectAll"
      />
    </div>

    <!-- Мобильное представление (карточки) -->
    <div class="md:hidden">
      <div v-if="!works || works.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        Нет добавленных работ
      </div>
      
      <div v-else class="space-y-4">
        <WorkCard
          v-for="work in works"
          :key="work.id"
          :work="work"
          :is-selected="isSelected(work.id)"
          :executors="executors"
          @edit="editWork"
          @delete="removeWork"
          @toggle-select="toggleSelect"
        />
      </div>
    </div>

    <!-- Модальное окно подтверждения массового удаления -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Подтверждение удаления</h3>
        <p class="mb-4">
          Вы уверены, что хотите удалить {{ selectedWorks.length }} работ(ы)?
        </p>
        <div class="flex justify-end space-x-2">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border rounded dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Отмена
          </button>
          <button
            @click="executeBatchDelete"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно массового назначения исполнителя -->
    <BatchAssignExecutorModal
      v-if="showBatchAssignModal"
      :show="showBatchAssignModal"
      :selected-works="selectedWorksForBatch"
      :executors="executors"
      @assign="executeBatchAssign"
      @close="showBatchAssignModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import WorkTable from './WorkTable.vue'
import WorkCard from './WorkCard.vue'
import BatchAssignExecutorModal from './BatchAssignExecutorModal.vue'

const props = defineProps({
  works: {
    type: Array,
    required: true
  },
  executors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'batch-delete', 'batch-assign'])

const selectedWorks = ref([])
const selectedWorksForBatch = ref([])
const showDeleteConfirm = ref(false)
const showBatchAssignModal = ref(false)

const isSelected = (workId) => {
  return selectedWorks.value.includes(workId)
}

const toggleSelect = (workId) => {
  const index = selectedWorks.value.indexOf(workId)
  if (index > -1) {
    selectedWorks.value.splice(index, 1)
  } else {
    selectedWorks.value.push(workId)
  }
}

const toggleSelectAll = () => {
  if (selectedWorks.value.length === props.works.length) {
    selectedWorks.value = []
  } else {
    selectedWorks.value = props.works.map(work => work.id)
  }
}

const editWork = (work) => {
  emit('edit', work)
}

const removeWork = (workId) => {
  emit('delete', workId)
}

const handleBatchDelete = (workIds) => {
  selectedWorks.value = workIds
  showDeleteConfirm.value = true
}

const handleBatchAssign = (workIds) => {
  selectedWorksForBatch.value = workIds
  showBatchAssignModal.value = true
}

const executeBatchDelete = () => {
  emit('batch-delete', selectedWorks.value)
  selectedWorks.value = []
  showDeleteConfirm.value = false
}

const executeBatchAssign = ({ workIds, executorId, executorPercentage }) => {
  emit('batch-assign', { workIds, executorId, executorPercentage })
  showBatchAssignModal.value = false
  selectedWorksForBatch.value = []
}
</script>

<style scoped>
/* Адаптивные стили для переключения между представлениями */
@media (max-width: 768px) {
  .hidden.md\:block {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .md\:hidden {
    display: none !important;
  }
}
</style>
