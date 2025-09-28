import { ref } from 'vue';
import { useWorkOperations } from './useWorkOperations';
import { useCrudOperations } from './useCrudOperations';
import { useNotifications } from './useNotifications';

/**
 * Композабл для работы с работами заказа
 * @param {Object} orderRef - Реактивная ссылка на заказ
 * @returns {Object} Объект с методами для работы с работами
 */
export function useOrderWorks(orderRef) {
  const { addWork: addWorkOperation, updateWork, removeWork, batchDeleteWorks, batchAssignExecutor } = useWorkOperations();
  const {
    createAddHandler,
    createEditHandler,
    createDeleteHandler,
    createBatchDeleteHandler,
    createBatchAssignHandler,
    createLocalStateUpdater
  } = useCrudOperations();
  const { notifySuccess, notifyError } = useNotifications();

  // Состояние для модальных окон рекомендаций
  const isRecommendedWorkModalOpen = ref(false);
  const currentRecommendedWork = ref({});

  // Функции обновления локального состояния
  const updateLocalWorks = createLocalStateUpdater(orderRef, 'works');

  // Обработчики для работ
  const handleAddWork = createAddHandler(
    (workData) => addWorkOperation(orderRef.value.id, workData),
    updateLocalWorks,
    'Работа'
  );

  const handleEditWork = createEditHandler(
    (workId, workData) => {
      return updateWork(workId, { ...workData, order: orderRef.value.id })
    },
    updateLocalWorks,
    'Работа'
  );

  const handleDeleteWork = createDeleteHandler(
    removeWork,
    updateLocalWorks,
    'Работа'
  );

  const handleBatchDelete = createBatchDeleteHandler(
    batchDeleteWorks,
    updateLocalWorks,
    'Работа'
  );

  const handleBatchAssign = createBatchAssignHandler(
    async (data) => {
      await batchAssignExecutor(data.workIds, data.executorId, data.executorPercentage);
      // После назначения исполнителя обновляем локальное состояние для каждой работы
      const updatedWorks = orderRef.value.works.map(work => {
        if (data.workIds.includes(work.id)) {
          return { 
            ...work, 
            executor: [{ id: data.executorId }], // Правильный формат для Strapi 5
            executorPercentage: data.executorPercentage 
          };
        }
        return work;
      });
      // Обновляем локальное состояние целиком
      updatedWorks.forEach(work => updateLocalWorks(work, 'update'));
    },
    () => {} // пустая функция, т.к. обновление локального состояния происходит вручную
  );

  // Обработчики для рекомендованных работ
  const handleAddRecommendedWork = async (work) => {
    try {
      // Пытаемся обновить существующую рекомендованную работу
      try {
        const updatedWork = await updateWork(work.id, {
          ...work,
          isRecomended: false
        });

        // Обновляем локальное состояние
        updateLocalWorks(updatedWork, 'update');
      } catch (error) {
        // Если работа не найдена (404), создаем новую и удаляем старую
        if (error.response?.status === 404) {
          console.info(`[INFO] Рекомендованная работа с ID ${work.id} устарела, создаем обновленную версию`);

          // Создаем новую работу
          const newWork = await addWorkOperation(orderRef.value.id, {
            ...work,
            isRecomended: false
          });

          // Пытаемся удалить старую работу из базы данных
          try {
            await removeWork(work.id);
          } catch (deleteError) {
            console.info(`[INFO] Старая работа ${work.id} уже была удалена или недоступна`);
          }

          // Удаляем старую работу из локального состояния и добавляем новую
          const workIndex = orderRef.value.works.findIndex(w => w.id === work.id);
          if (workIndex !== -1) {
            orderRef.value.works.splice(workIndex, 1);
          }
          updateLocalWorks(newWork, 'add');
        } else {
          throw error;
        }
      }

      notifySuccess('Рекомендованная работа добавлена в план');
    } catch (error) {
      notifyError('Ошибка добавления рекомендованной работы', error.message);
    }
  };

  const handleEditRecommendedWork = (work) => {
    currentRecommendedWork.value = { ...work };
    isRecommendedWorkModalOpen.value = true;
  };

  const handleDeleteRecommendedWork = handleDeleteWork;

  const onSaveRecommendedWork = async (workData) => {
    try {
      const workId = currentRecommendedWork.value.id || workData.id;

      // Проверяем, является ли это существующей работой или новой
      if (workId && !String(workId).startsWith('temp_')) {
        try {
          const workToUpdate = { ...workData, id: workId, orderId: orderRef.value.id };
          const updatedWork = await updateWork(workId, workToUpdate);
          updateLocalWorks(updatedWork, 'update');
        } catch (error) {
          // Если работа не найдена (404), создаем новую и удаляем старую
          if (error.response?.status === 404) {
            console.info(`[INFO] Рекомендованная работа с ID ${workId} устарела, создаем обновленную версию`);

            // Создаем новую работу
            const newWork = await addWorkOperation(orderRef.value.id, workData);

            // Пытаемся удалить старую работу из базы данных
            try {
              await removeWork(workId);
            } catch (deleteError) {
              console.info(`[INFO] Старая работа ${workId} уже была удалена или недоступна`);
            }

            // Удаляем старую работу из локального состояния и добавляем новую
            const workIndex = orderRef.value.works.findIndex(w => w.id === workId);
            if (workIndex !== -1) {
              orderRef.value.works.splice(workIndex, 1);
            }
            updateLocalWorks(newWork, 'add');
          } else {
            throw error;
          }
        }
      } else {
        // Создаем новую работу
        const newWork = await addWorkOperation(orderRef.value.id, workData);

        // Если это была временная работа, заменяем её
        if (workId && String(workId).startsWith('temp_')) {
          const workIndex = orderRef.value.works.findIndex(w => w.id === workId);
          if (workIndex !== -1) {
            orderRef.value.works.splice(workIndex, 1);
          }
        }

        updateLocalWorks(newWork, 'add');
      }

      closeRecommendedWorkModal();
      notifySuccess('Работа успешно сохранена');
    } catch (error) {
      console.error('Ошибка при сохранении работы:', error);
      notifyError('Ошибка при сохранении работы', error.message);
    }
  };

  const closeRecommendedWorkModal = () => {
    isRecommendedWorkModalOpen.value = false;
    currentRecommendedWork.value = {};
  };

  return {
    // Состояние
    isRecommendedWorkModalOpen,
    currentRecommendedWork,

    // Методы для работ
    handleAddWork,
    handleEditWork,
    handleDeleteWork,
    handleBatchDelete,
    handleBatchAssign,

    // Методы для рекомендованных работ
    handleAddRecommendedWork,
    handleEditRecommendedWork,
    handleDeleteRecommendedWork,
    onSaveRecommendedWork,
    closeRecommendedWorkModal,

    // Утилиты
    updateLocalWorks
  };
}
