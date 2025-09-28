import { ref } from 'vue';
import { useNotifications } from './useNotifications';

/**
 * Универсальный композабл для CRUD операций
 * @returns {Object} Объект с методами для CRUD операций
 */
export function useCrudOperations() {
  const { notifySuccess, notifyError } = useNotifications();
  const loading = ref(false);

  /**
   * Выполняет операцию с обработкой ошибок и уведомлениями
   * @param {Function} operation - Асинхронная функция операции
   * @param {Object} messages - Сообщения для уведомлений
   * @param {string} messages.success - Сообщение об успехе
   * @param {string} messages.error - Сообщение об ошибке
   * @param {boolean} [showLoading=true] - Показывать ли индикатор загрузки
   * @returns {Promise} Результат операции
   */
  const executeOperation = async (operation, messages, showLoading = true) => {
    try {
      if (showLoading) {
        loading.value = true;
      }
      
      const result = await operation();
      
      if (messages.success) {
        notifySuccess(messages.success);
      }
      
      return result;
    } catch (error) {
      console.error('Operation failed:', error);
      
      const errorMessage = error.message || messages.error || 'Произошла ошибка';
      notifyError(messages.error || 'Ошибка операции', errorMessage);
      
      throw error;
    } finally {
      if (showLoading) {
        loading.value = false;
      }
    }
  };

  /**
   * Создает обработчик для добавления элемента
   * @param {Function} addFunction - Функция добавления
   * @param {Function} updateLocalState - Функция обновления локального состояния
   * @param {string} itemType - Тип элемента (для сообщений)
   * @returns {Function} Обработчик добавления
   */
  const createAddHandler = (addFunction, updateLocalState, itemType) => {
    return async (itemData) => {
      return executeOperation(
        async () => {
          const newItem = await addFunction(itemData);
          updateLocalState(newItem, 'add');
          return newItem;
        },
        {
          success: `${itemType} успешно добавлен${itemType.endsWith('ь') ? 'а' : ''}`,
          error: `Ошибка добавления ${itemType.toLowerCase()}`
        }
      );
    };
  };

  /**
   * Создает обработчик для редактирования элемента
   * @param {Function} updateFunction - Функция обновления
   * @param {Function} updateLocalState - Функция обновления локального состояния
   * @param {string} itemType - Тип элемента (для сообщений)
   * @returns {Function} Обработчик редактирования
   */
  const createEditHandler = (updateFunction, updateLocalState, itemType) => {
    return async (itemData) => {

      return executeOperation(
        async () => {
      
          const updatedItem = await updateFunction(itemData.id, itemData);
         
          updateLocalState(updatedItem, 'update');
          return updatedItem;
        },
        {
          success: `${itemType} успешно обновлена`,
          error: `Ошибка обновления ${itemType.toLowerCase()}`
        }
      );
    };
  };

  /**
   * Создает обработчик для удаления элемента
   * @param {Function} deleteFunction - Функция удаления
   * @param {Function} updateLocalState - Функция обновления локального состояния
   * @param {string} itemType - Тип элемента (для сообщений)
   * @returns {Function} Обработчик удаления
   */
  const createDeleteHandler = (deleteFunction, updateLocalState, itemType) => {
    return async (itemId) => {
      return executeOperation(
        async () => {
          await deleteFunction(itemId);
          updateLocalState(itemId, 'delete');
          return true;
        },
        {
          success: `${itemType} успешно удален${itemType.endsWith('ь') ? 'а' : ''}`,
          error: `Ошибка удаления ${itemType.toLowerCase()}`
        }
      );
    };
  };

  /**
   * Создает обработчик для массового удаления
   * @param {Function} batchDeleteFunction - Функция массового удаления
   * @param {Function} updateLocalState - Функция обновления локального состояния
   * @param {string} itemType - Тип элемента (для сообщений)
   * @returns {Function} Обработчик массового удаления
   */
  const createBatchDeleteHandler = (batchDeleteFunction, updateLocalState, itemType) => {
    return async (itemIds) => {
      if (!confirm(`Вы уверены, что хотите удалить ${itemIds.length} ${itemType.toLowerCase()}(ы)?`)) {
        return false;
      }

      return executeOperation(
        async () => {
          await batchDeleteFunction(itemIds);
          updateLocalState(itemIds, 'batchDelete');
          return true;
        },
        {
          success: `${itemIds.length} ${itemType.toLowerCase()}(ы) успешно удалены`,
          error: `Ошибка при удалении ${itemType.toLowerCase()}`
        }
      );
    };
  };

  /**
   * Создает обработчик для массового назначения исполнителя
   * @param {Function} batchAssignFunction - Функция массового назначения
   * @param {Function} updateLocalState - Функция обновления локального состояния
   * @returns {Function} Обработчик массового назначения
   */
  const createBatchAssignHandler = (batchAssignFunction, updateLocalState) => {
    return async ({ workIds, executorId, executorPercentage }) => {
      return executeOperation(
        async () => {
          await batchAssignFunction(workIds, executorId, executorPercentage);
          // Не вызываем updateLocalState здесь, обновление локального состояния происходит вручную
          return true;
        },
        {
          success: 'Исполнитель успешно назначен',
          error: 'Ошибка при назначении исполнителя'
        }
      );
    };
  };

  /**
   * Создает функцию для оптимистичного обновления локального состояния
   * @param {Object} stateRef - Реактивная ссылка на состояние
   * @param {string} arrayKey - Ключ массива в состоянии
   * @returns {Function} Функция обновления состояния
   */
  const createLocalStateUpdater = (stateRef, arrayKey) => {
    return (data, operation) => {
            
      if (!stateRef.value[arrayKey]) {
        stateRef.value[arrayKey] = [];
      }

      switch (operation) {
        case 'add':
          stateRef.value[arrayKey].push(data);
          break;
        
        case 'update':
          const updateIndex = stateRef.value[arrayKey].findIndex(item => item.id === data.id);
          
          if (updateIndex !== -1) {
            // Реактивное обновление объекта в массиве
           
            Object.assign(stateRef.value[arrayKey][updateIndex], data);
            
          }
          break;
        
        case 'delete':
          stateRef.value[arrayKey] = stateRef.value[arrayKey].filter(item => item.id !== data);
          break;
        
        case 'batchDelete':
          stateRef.value[arrayKey] = stateRef.value[arrayKey].filter(item => !data.includes(item.id));
          break;
        
        case 'batchAssign':
          stateRef.value[arrayKey] = stateRef.value[arrayKey].map(item => {
            if (data.workIds.includes(item.id)) {
              return { ...item, executor: data.executorId, executorPercentage: data.executorPercentage };
            }
            return item;
          });
          break;
      }
    };
  };

  return {
    loading,
    executeOperation,
    createAddHandler,
    createEditHandler,
    createDeleteHandler,
    createBatchDeleteHandler,
    createBatchAssignHandler,
    createLocalStateUpdater
  };
}
