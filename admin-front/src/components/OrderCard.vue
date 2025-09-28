<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <!-- Заголовок с ID и действиями -->
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-semibold">Заказ #{{ order.id }}</h3>
      <div class="flex space-x-2">
        <button @click="editOrder" class="p-1 text-yellow-500 hover:text-yellow-600" title="Редактировать">
          ✏️
        </button>
        <button @click="deleteOrder" class="p-1 text-red-500 hover:text-red-600" title="Удалить">
          🗑️
        </button>
      </div>
    </div>

    <!-- Информация о статусе -->
    <div class="mb-3">
      <span :class="statusColorClass" class="px-2 py-1 rounded text-sm font-medium">
        {{ orderStatusText }}
      </span>
    </div>

    <!-- Информация о клиенте и автомобиле -->
    <div class="space-y-2 mb-3 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Клиент:</span>
        <span class="font-medium">{{ clientName }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Автомобиль:</span>
        <span class="font-medium">{{ carName }}</span>
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

    <!-- Статистика работ -->
    <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Работ:</span>
        <span class="font-medium">{{ order.works?.length || 0 }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">Сумма:</span>
        <span class="font-medium">{{ worksTotal }} руб.</span>
      </div>
    </div>

    <!-- Кнопка развернуть/свернуть -->
    <button @click="toggleExpanded"
      class="w-full py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border-t border-gray-200 dark:border-gray-600">
      {{ isExpanded ? 'Свернуть' : 'Развернуть' }}
    </button>

    <!-- Развернутая информация -->
    <div v-if="isExpanded" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
      <!-- Описание работ -->
      <div class="mb-3">
        <h4 class="font-semibold mb-2">Описание работ:</h4>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ order.description || 'Не указано' }}</p>
      </div>

      <!-- Список работ -->
      <div class="mb-3">
        <h4 class="font-semibold mb-2">Работы:</h4>
        <div v-if="order.works && order.works.length > 0" class="space-y-2">
          <div v-for="(work, index) in order.works" :key="index"
            class="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
            <div class="flex justify-between items-start">
              <div class="font-medium">{{ work.name }}</div>
              <div class="text-right">
                <div class="font-medium">{{ work.cost }} руб.</div>
                <div :class="workStatusColorClass(work.status_of_work)" class="text-xs">
                  {{ workStatusText(work.status_of_work) }}
                </div>
              </div>
            </div>
            <div v-if="work.description" class="text-gray-600 dark:text-gray-400 text-xs mt-1">
              {{ work.description }}
            </div>
            <div v-if="work.executor" class="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Исполнитель: {{ getExecutorName(work.executor) }}
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
          Нет добавленных работ
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>Создан: {{ formatDate(order.createdAt) }}</div>
        <div>Примечания: {{ order.notes || 'Нет' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getExecutorName } from '../utils/executorUtils'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle'])

const router = useRouter()

// Вычисляемые свойства
const clientName = computed(() => {
  return props.order.client?.name || 'Неизвестный клиент'
})

const carName = computed(() => {
  if (!props.order.car) return 'Не указан'
  return `${props.order.car.make || ''} ${props.order.car.model || ''}`.trim() || 'Не указан'
})

const worksTotal = computed(() => {
  if (!props.order.works || props.order.works.length === 0) return 0
  return props.order.works.reduce((sum, work) => sum + (work.cost || 0), 0)
})

const orderStatusText = computed(() => {
  const statusMap = {
    'new': 'Новый',
    'in_progress': 'В работе',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  }
  return statusMap[props.order.orderstatus] || props.order.orderstatus || 'Неизвестен'
})

const statusColorClass = computed(() => {
  const colorMap = {
    'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colorMap[props.order.orderstatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
})

// Методы
const editOrder = () => {
  router.push({ name: 'order-edit', params: { id: props.order.id } })
}

const deleteOrder = () => {
  emit('delete', props.order.id)
}

const toggleExpanded = () => {
  emit('toggle', props.order.id)
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

const workStatusColorClass = (status) => {
  const colorMap = {
    'pending': 'text-yellow-600 dark:text-yellow-400',
    'in_progress': 'text-blue-600 dark:text-blue-400',
    'completed': 'text-green-600 dark:text-green-400'
  }
  return colorMap[status] || 'text-gray-500'
}

const workStatusText = (status) => {
  const textMap = {
    'pending': 'Ожидает',
    'in_progress': 'В работе',
    'completed': 'Завершена'
  }
  return textMap[status] || status
}

</script>
