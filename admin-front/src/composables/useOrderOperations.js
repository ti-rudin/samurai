import { ref } from 'vue';
import { useOrdersStore } from '../stores/orders';

export function useOrderOperations() {
  const ordersStore = useOrdersStore();
  const loading = ref(false);
  const error = ref(null);

  // Загрузка заказа по ID
  const loadOrder = async (orderId) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Используем существующий заказ из store, если он есть
      const existingOrder = ordersStore.orders.find(o => o.id === parseInt(orderId));

      if (existingOrder) {
        return existingOrder;
      }
      
      // Если заказа нет в store, загружаем с сервера
      const response = await ordersStore.fetchOrderById(orderId);
      
      if (!response) {
        throw new Error('Не удалось загрузить данные заказа');
      }
      
      return response;
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки данных';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId, status) => {
    try {
      loading.value = true;
      const updatedOrder = await ordersStore.updateOrderStatus(orderId, status);
      return updatedOrder;
    } catch (err) {
      error.value = err.message || 'Ошибка обновления статуса';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Обновление описания заказа
  const updateOrderDescription = async (orderId, description) => {
    try {
      loading.value = true;
      const updatedOrder = await ordersStore.updateOrder(orderId, { description });
      return updatedOrder;
    } catch (err) {
      error.value = err.message || 'Ошибка обновления описания';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Обновление примечаний заказа
  const updateOrderNotes = async (orderId, notes) => {
    try {
      loading.value = true;
      const updatedOrder = await ordersStore.updateOrder(orderId, { notes });
      return updatedOrder;
    } catch (err) {
      error.value = err.message || 'Ошибка обновления примечаний';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    loadOrder,
    updateOrderStatus,
    updateOrderDescription,
    updateOrderNotes
  };
}
