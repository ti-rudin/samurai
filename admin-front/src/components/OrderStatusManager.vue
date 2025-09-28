<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 mb-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Статус заказа</h3>

      <div class="flex items-center space-x-2">
        <select
          :value="props.order.orderstatus"
          @change="handleStatusChange"
          class="px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3e%3cpath stroke=%22%236b7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22M6 8l4 4 4-4%22/%3e%3c/svg%3e'); background-position: right 12px center; background-repeat: no-repeat; background-size: 16px;"
        >
          <option value="new">Новый</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Завершен</option>
          <option value="cancelled">Отменен</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderOperations } from '../composables/useOrderOperations';
import { useNotifications } from '../composables/useNotifications';

const props = defineProps({
  order: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['status-updated']);

const { updateOrderStatus } = useOrderOperations();
const { notifySuccess, notifyError } = useNotifications();

// Функция для получения текстового представления статуса
const getStatusText = (status) => {
  const statusMap = {
    'new': 'Новый',
    'in_progress': 'В работе',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  };
  return statusMap[status] || status || 'Неизвестен';
};

// Обработчик изменения статуса
const handleStatusChange = async (event) => {
  const newStatus = event.target.value;
  const oldStatus = props.order.orderstatus;

  if (newStatus === oldStatus) return;

  try {
    const updatedOrder = await updateOrderStatus(props.order.id, newStatus);

    // Обновляем локальное состояние через emit
    emit('status-updated', updatedOrder);

    const newStatusText = getStatusText(newStatus);
    notifySuccess(`Статус заказа изменен на "${newStatusText}"`);
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error);
    notifyError(`Не удалось изменить статус заказа: ${error.message}`);

    // Возвращаем предыдущее значение в селекте
    event.target.value = oldStatus;
  }
};
</script>
