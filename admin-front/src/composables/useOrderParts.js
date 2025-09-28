import { ref } from 'vue';
import { usePartOperations } from './usePartOperations';
import { useCrudOperations } from './useCrudOperations';
import { useNotifications } from './useNotifications';

/**
 * Композабл для работы с запчастями заказа
 * @param {Object} orderRef - Реактивная ссылка на заказ
 * @returns {Object} Объект с методами для работы с запчастями
 */
export function useOrderParts(orderRef) {
  const { addPart: addPartOperation, updatePart, removePart: removePartOperation } = usePartOperations();
  const {
    createAddHandler,
    createEditHandler,
    createDeleteHandler,
    createBatchDeleteHandler,
    createLocalStateUpdater
  } = useCrudOperations();
  const { notifySuccess, notifyError } = useNotifications();

  // Состояние для модальных окон рекомендаций
  const isRecommendedPartModalOpen = ref(false);
  const currentRecommendedPart = ref({});

  // Функции обновления локального состояния
  const updateLocalParts = createLocalStateUpdater(orderRef, 'parts');

  // Обработчики для запчастей
  const handleAddPart = createAddHandler(
    (partData) => addPartOperation(orderRef.value.id, partData),
    updateLocalParts,
    'Запчасть'
  );

  // Кастомный обработчик редактирования с поддержкой 404 ошибок
  const handleEditPart = async (partData) => {
    try {
      const partId = partData.id;
      try {
        const updatedPart = await updatePart(partId, { ...partData, orderId: orderRef.value.id });
        updateLocalParts(updatedPart, 'update');
        notifySuccess('Запчасть успешно обновлена');
        return updatedPart;
      } catch (error) {
        // Если запчасть не найдена (404), создаем новую и удаляем старую
        if (error.response?.status === 404) {
          console.info(`[INFO] Запчасть с ID ${partId} не найдена на сервере, создаем новую`);

          // Создаем новую запчасть
          const newPart = await addPartOperation(orderRef.value.id, partData);

          // Пытаемся удалить старую запчасть из базы данных
          try {
            await removePartOperation(partId);
          } catch (deleteError) {
            console.info(`[INFO] Старая запчасть ${partId} уже была удалена или недоступна`);
          }

          // Удаляем старую запчасть из локального состояния и добавляем новую
          const partIndex = orderRef.value.parts.findIndex(p => p.id === partId);
          if (partIndex !== -1) {
            orderRef.value.parts.splice(partIndex, 1);
          }
          updateLocalParts(newPart, 'add');

          notifySuccess('Запчасть успешно обновлена');
          return newPart;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении запчасти:', error);
      notifyError('Ошибка обновления запчасти', error.message);
      throw error;
    }
  };

  const handleDeletePart = createDeleteHandler(
    removePartOperation,
    updateLocalParts,
    'Запчасть'
  );

  const handleBatchDeleteParts = createBatchDeleteHandler(
    (partIds) => Promise.all(partIds.map(partId => removePartOperation(partId))),
    updateLocalParts,
    'Запчасть'
  );

  // Обработчики для рекомендованных запчастей
  const handleAddRecommendedPart = async (part) => {
    try {
      // Пытаемся обновить существующую рекомендованную запчасть
      try {
        const updatedPart = await updatePart(part.id, {
          ...part,
          isRecomended: false
        });

        // Обновляем локальное состояние
        updateLocalParts(updatedPart, 'update');
      } catch (error) {
        // Если запчасть не найдена (404), создаем новую и удаляем старую
        if (error.response?.status === 404) {
          console.info(`[INFO] Рекомендованная запчасть с ID ${part.id} устарела, создаем обновленную версию`);

          // Создаем новую запчасть
          const newPart = await addPartOperation(orderRef.value.id, {
            ...part,
            isRecomended: false
          });

          // Пытаемся удалить старую запчасть из базы данных
          try {
            await removePartOperation(part.id);
          } catch (deleteError) {
            console.info(`[INFO] Старая запчасть ${part.id} уже была удалена или недоступна`);
          }

          // Удаляем старую запчасть из локального состояния и добавляем новую
          const partIndex = orderRef.value.parts.findIndex(p => p.id === part.id);
          if (partIndex !== -1) {
            orderRef.value.parts.splice(partIndex, 1);
          }
          updateLocalParts(newPart, 'add');
        } else {
          throw error;
        }
      }

      notifySuccess('Рекомендованная запчасть добавлена в план');
    } catch (error) {
      notifyError('Ошибка добавления рекомендованной запчасти', error.message);
    }
  };

  const handleEditRecommendedPart = (part) => {
    currentRecommendedPart.value = { ...part };
    isRecommendedPartModalOpen.value = true;
  };

  const handleDeleteRecommendedPart = handleDeletePart;

  const onSaveRecommendedPart = async (partData) => {
    try {
      const partId = currentRecommendedPart.value.id || partData.id;

      // Проверяем, является ли это существующей запчастью или новой
      if (partId && !String(partId).startsWith('temp_')) {
        try {
          const partToUpdate = { ...partData, id: partId, orderId: orderRef.value.id };
          const updatedPart = await updatePart(partId, partToUpdate);
          updateLocalParts(updatedPart, 'update');
        } catch (error) {
          // Если запчасть не найдена (404), создаем новую и удаляем старую
          if (error.response?.status === 404) {
            console.info(`[INFO] Рекомендованная запчасть с ID ${partId} устарела, создаем обновленную версию`);

            // Создаем новую запчасть
            const newPart = await addPartOperation(orderRef.value.id, partData);

            // Пытаемся удалить старую запчасть из базы данных
            try {
              await removePartOperation(partId);
            } catch (deleteError) {
              console.info(`[INFO] Старая запчасть ${partId} уже была удалена или недоступна`);
            }

            // Удаляем старую запчасть из локального состояния и добавляем новую
            const partIndex = orderRef.value.parts.findIndex(p => p.id === partId);
            if (partIndex !== -1) {
              orderRef.value.parts.splice(partIndex, 1);
            }
            updateLocalParts(newPart, 'add');
          } else {
            throw error;
          }
        }
      } else {
        // Создаем новую запчасть
        const newPart = await addPartOperation(orderRef.value.id, partData);

        // Если это была временная запчасть, заменяем её
        if (partId && String(partId).startsWith('temp_')) {
          const partIndex = orderRef.value.parts.findIndex(p => p.id === partId);
          if (partIndex !== -1) {
            orderRef.value.parts.splice(partIndex, 1);
          }
        }

        updateLocalParts(newPart, 'add');
      }

      closeRecommendedPartModal();
      notifySuccess('Запчасть успешно сохранена');
    } catch (error) {
      console.error('Ошибка при сохранении запчасти:', error);
      notifyError('Ошибка при сохранении запчасти', error.message);
    }
  };

  const closeRecommendedPartModal = () => {
    isRecommendedPartModalOpen.value = false;
    currentRecommendedPart.value = {};
  };

  return {
    // Состояние
    isRecommendedPartModalOpen,
    currentRecommendedPart,

    // Методы для запчастей
    handleAddPart,
    handleEditPart,
    handleDeletePart,
    handleBatchDeleteParts,

    // Методы для рекомендованных запчастей
    handleAddRecommendedPart,
    handleEditRecommendedPart,
    handleDeleteRecommendedPart,
    onSaveRecommendedPart,
    closeRecommendedPartModal,

    // Утилиты
    updateLocalParts
  };
}
