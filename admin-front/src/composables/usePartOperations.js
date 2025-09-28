import { ref } from 'vue';
import { useOrdersStore } from '../stores/orders';

export function usePartOperations() {
  const ordersStore = useOrdersStore();
  const loading = ref(false);
  const error = ref(null);

  // Добавление запчасти
  const addPart = async (orderId, partData) => {
    try {
      loading.value = true;
      error.value = null;
      
      const newPart = await ordersStore.addPart(orderId, partData);
      
      return newPart;
    } catch (err) {
      error.value = err.message || 'Ошибка добавления запчасти';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Обновление запчасти
  const updatePart = async (partId, partData) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Добавляем orderId в partData, если его нет
      if (!partData.orderId) {
        partData.orderId = partData.order ? partData.order.id : null;
      }
      
      const updatedPart = await ordersStore.updatePart(partId, partData);
      
      return updatedPart;
    } catch (err) {
      error.value = err.message || 'Ошибка обновления запчасти';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Удаление запчасти
  const removePart = async (partId) => {
    try {
      loading.value = true;
      error.value = null;
      
      await ordersStore.removePart(partId);
      
      return true;
    } catch (err) {
      error.value = err.message || 'Ошибка удаления запчасти';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Массовое удаление запчастей
  const batchDeleteParts = async (partIds) => {
    try {
      loading.value = true;
      error.value = null;
      
      await Promise.all(partIds.map(partId => ordersStore.removePart(partId)));
      
      return true;
    } catch (err) {
      error.value = err.message || 'Ошибка удаления запчастей';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Добавление рекомендуемой запчасти в используемые
  const addRecommendedPartToUsed = async (orderId, recommendedPart) => {
    try {
      loading.value = true;
      error.value = null;
      
      const newPart = await ordersStore.addPart(orderId, {
        ...recommendedPart,
        isRecomended: false
      });
      
      return newPart;
    } catch (err) {
      error.value = err.message || 'Ошибка добавления запчасти';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    addPart,
    updatePart,
    removePart,
    batchDeleteParts,
    addRecommendedPartToUsed
  };
}
