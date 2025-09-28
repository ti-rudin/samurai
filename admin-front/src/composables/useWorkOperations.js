import { ref } from 'vue';
import { useOrdersStore } from '../stores/orders';
import { transformWorkData } from '../utils/dataTransformers';

export function useWorkOperations() {
  const ordersStore = useOrdersStore();
  const loading = ref(false);
  const error = ref(null);

  // Добавление работы
  const addWork = async (orderId, workData) => {
    try {
      loading.value = true;
      error.value = null;

      const newWork = await ordersStore.addWork(orderId, workData);


      return newWork;
    } catch (err) {
      error.value = err.message || 'Ошибка добавления работы';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Обновление работы
  const updateWork = async (workId, workData) => {
    try {
      loading.value = true;
      error.value = null;
            
      const updatedWork = await ordersStore.updateWork(workId, workData);
            
      // Преобразуем данные работы
      const transformedWork = transformWorkData(updatedWork);
            
      return transformedWork;
    } catch (err) {
      error.value = err.message || 'Ошибка обновления работы';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Удаление работы
  const removeWork = async (workId) => {
    try {
      loading.value = true;
      error.value = null;
      
      await ordersStore.removeWork(workId);
      
      return true;
    } catch (err) {
      error.value = err.message || 'Ошибка удаления работы';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Массовое удаление работ
  const batchDeleteWorks = async (workIds) => {
    try {
      loading.value = true;
      error.value = null;
      
      await ordersStore.batchDeleteWorks(workIds);
      
      return true;
    } catch (err) {
      error.value = err.message || 'Ошибка удаления работ';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Массовое назначение исполнителя
  const batchAssignExecutor = async (workIds, executorId, executorPercentage = null) => {
    try {
      loading.value = true;
      error.value = null;

      await ordersStore.batchAssignExecutor(workIds, executorId, executorPercentage);

      return true;
    } catch (err) {
      error.value = err.message || 'Ошибка назначения исполнителя';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    addWork,
    updateWork,
    removeWork,
    batchDeleteWorks,
    batchAssignExecutor
  };
}
