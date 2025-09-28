import { defineStore } from 'pinia';
import api from '../api/strapi';
import { transformWorkData } from '../utils/dataTransformers';

export const useWorkStore = defineStore('works', () => {
  /**
   * Добавление работы к заказу
   */
  async function addWork(orderId, workData) {
    try {
      // Функция для нормализации executor в массив ID
      function normalizeExecutor(executor) {
        if (!executor) return [];
        if (Array.isArray(executor)) {
          return executor;
        } else if (typeof executor === 'object') {
          return [executor.id];
        } else if (typeof executor === 'number' || typeof executor === 'string') {
          return [executor];
        }
        return [];
      }

      // Формируем данные для создания в формате Strapi
      const createData = {
        name: workData.name,
        description: workData.description,
        cost: workData.cost,
        status_of_work: workData.status_of_work || 'pending',
        executorPercentage: workData.executorPercentage,
        isRecomended: workData.isRecomended || false,
        order: orderId
      };

      // Обрабатываем executorPays
      if (workData.executorPays) {
        try {
          if (typeof workData.executorPays === 'string') {
            createData.executorPays = workData.executorPays;
          } else if (Array.isArray(workData.executorPays)) {
            createData.executorPays = JSON.stringify(workData.executorPays);
          }
        } catch (error) {
          console.error('[workStore] Error processing executorPays:', error);
        }
      }

      // Обрабатываем связь executor для manyToMany - используем set
      if (workData.executor) {
        createData.executor = {
          set: normalizeExecutor(workData.executor)
        };
      }


      const response = await api.post('/works', {
        data: createData
      });

      // Преобразуем данные работы
      const addedWork = transformWorkData(response.data.data);
      return addedWork;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновление работы
   */
  async function updateWork(workId, updatedData) {
    try {
      console.log('[workStore] updateWork called with workId:', workId, 'updatedData:', updatedData);
      console.log('[workStore] updatedData.executor:', updatedData.executor);

      // Функция для нормализации executor в массив ID
      function normalizeExecutor(executor) {
        if (!executor) return [];
        if (Array.isArray(executor)) {
          return executor;
        } else if (typeof executor === 'object') {
          return [executor.id];
        } else if (typeof executor === 'number' || typeof executor === 'string') {
          return [executor];
        }
        return [];
      }

      // Формируем данные для обновления в формате Strapi
      const updateData = {
        name: updatedData.name,
        description: updatedData.description,
        cost: updatedData.cost,
        status_of_work: updatedData.status_of_work,
        executorPercentage: updatedData.executorPercentage,
        isRecomended: updatedData.isRecomended || false,
      };

      // Обрабатываем executorPays
      if (updatedData.executorPays !== undefined) {
        try {
          if (typeof updatedData.executorPays === 'string') {
            updateData.executorPays = updatedData.executorPays;
          } else if (Array.isArray(updatedData.executorPays)) {
            updateData.executorPays = JSON.stringify(updatedData.executorPays);
          }
        } catch (error) {
          console.error('[workStore] Error processing executorPays:', error);
        }
      }

      // Обрабатываем связь executor для manyToMany - используем set для полной замены
      if (updatedData.executor !== undefined) {
        const normalizedExecutor = normalizeExecutor(updatedData.executor);
        updateData.executor = {
          set: normalizedExecutor // Устанавливаем новых исполнителей
        };
      }

      // Обрабатываем связь order - просто ID
      if (updatedData.order) {
        updateData.order = updatedData.order;
      } else if (updatedData.orderId) {
        updateData.order = updatedData.orderId;
      }

      console.log('[workStore] Sending update data:', updateData);

      const response = await api.put(`/works/${workId}`, {
        data: updateData
      });

      // Преобразуем данные работы
      const updatedWork = transformWorkData(response.data.data);
      console.log('[workStore] updateWork result:', updatedWork);
      return updatedWork;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удаление работы
   */
  async function removeWork(workId) {
    try {
      const response = await api.delete(`/works/${workId}`);
      
      if (response.status === 200 || response.status === 204) {
        return true;
      } else {
        throw new Error(`Ошибка удаления работы: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Массовое удаление работ
   */
  async function batchDeleteWorks(workIds) {
    try {
      const results = await Promise.all(
        workIds.map(workId => removeWork(workId))
      );
      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Массовое назначение исполнителя
   */
  async function batchAssignExecutor(workIds, executorId, executorPercentage = null) {
    try {
      // Получаем текущие работы, чтобы взять orderId
      const currentWorksResponse = await api.get('/works', {
        params: {
          filters: {
            id: {
              $in: workIds
            }
          }
        }
      });
      const currentWorks = currentWorksResponse.data.data;

      const results = await Promise.all(
        workIds.map(workId => {
          const work = currentWorks.find(w => w.id === workId);
          const orderId = work?.attributes?.order?.data?.id || null;

          // Для массового назначения создаем executorPays с одним исполнителем
          const executorPays = [{
            id: executorId,
            percentage: 100 // Для совместимости с старым форматом
          }];

          return updateWork(workId, {
            executorPays: JSON.stringify(executorPays),
            executorPercentage: executorPercentage,
            orderId: orderId
          });
        })
      );
      return results;
    } catch (error) {
      throw error;
    }
  }

  return {
    addWork,
    updateWork,
    removeWork,
    batchDeleteWorks,
    batchAssignExecutor
  };
});
