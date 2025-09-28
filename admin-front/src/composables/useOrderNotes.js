import { ref } from 'vue';
import { useOrderOperations } from './useOrderOperations';
import { useNotifications } from './useNotifications';
import { useSettingsStore } from '../stores/settings';

/**
 * Композабл для работы с описанием и примечаниями заказа
 * @param {Object} orderRef - Реактивная ссылка на заказ
 * @returns {Object} Объект с методами для работы с описанием и примечаниями
 */
export function useOrderNotes(orderRef) {
  const { updateOrderDescription, updateOrderNotes } = useOrderOperations();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Состояние
  const notesChanged = ref(false);

  // Обработчики описания и примечаний
  const updateDescription = (newDescription) => {
    orderRef.value.description = newDescription;
    notesChanged.value = true;
  };

  const saveDescription = async () => {
    try {
      await updateOrderDescription(orderRef.value.id, orderRef.value.description);
      notesChanged.value = false;
      notifySuccess('Описание сохранено');
    } catch (error) {
      notifyError('Ошибка при сохранении описания', error.message);
    }
  };

  const updateNotes = (newNotes) => {
    orderRef.value.notes = newNotes;
  };

  const saveNotes = async () => {
    try {
      await updateOrderNotes(orderRef.value.id, orderRef.value.notes);
      notifySuccess('Примечания сохранены');
    } catch (error) {
      notifyError('Ошибка при сохранении примечаний', error.message);
    }
  };

  // Генерация списка работ через AI
  const generateWorkList = async (addWorkOperation, updateLocalWorks, addPartOperation, updateLocalParts, loading) => {
    // updateLocalWorks и updateLocalParts больше не используются, но оставляем для совместимости
    try {
      if (!loading) {
        console.warn('Loading parameter is undefined, using fallback');
        loading = { value: false };
      }

      const settingsStore = useSettingsStore();

      loading.value = true;
      notifyInfo('Генерация списка работ', 'Идет обработка описания и создание списка работ...', 3000);

      // Автоматически сохраняем описание перед генерацией
      if (notesChanged.value) {
        try {
          await updateOrderDescription(orderRef.value.id, orderRef.value.description);
          notesChanged.value = false;
          console.info('[INFO] Описание автоматически сохранено перед генерацией');
        } catch (error) {
          console.warn('Не удалось сохранить описание перед генерацией:', error);
          // Продолжаем генерацию даже если сохранение не удалось
        }
      }

      const requestBody = {
        description: orderRef.value.description,
        car: orderRef.value.car,
        hourlyRate: settingsStore.hourlyRate
      };
      
      const response = await fetch('/ai-opis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();
      
      // Функция для валидации и исправления данных работы
      const validateWorkData = (workData) => {
        if (!workData || typeof workData !== 'object') return null;

        return {
          name: workData.name || workData.description || 'Работа',
          description: workData.description || workData.name || 'Описание отсутствует',
          cost: Number(workData.cost) || Number(workData.price) || 0,
          status_of_work: workData.status_of_work || 'pending',
          executorPercentage: workData.executorPercentage || 0,
          isRecomended: workData.isRecomended || false
        };
      };

      // Функция для валидации и исправления данных запчасти
      const validatePartData = (partData) => {
        if (!partData || typeof partData !== 'object') return null;

        return {
          number: partData.number || partData.name || 'Неизвестно',
          name: partData.name || partData.number || 'Запчасть',
          quantity: Number(partData.quantity) || 1,
          price: Number(partData.price) || Number(partData.cost) || 0,
          partstatus: partData.partstatus || 'need_to_order',
          isRecomended: partData.isRecomended || false
        };
      };

      // Добавляем обычные работы
      if (data.works && Array.isArray(data.works)) {
        
        for (const workData of data.works) {
        
          try {
            const validatedWork = validateWorkData(workData);
           
            if (validatedWork) {
              
              const newWork = await addWorkOperation(orderRef.value.id, validatedWork);
             
            } else {
              console.warn('Некорректные данные работы:', workData);
            }
          } catch (error) {
            console.error('Ошибка добавления работы:', error);
          }
        }
      }

      // Добавляем обычные запчасти
      if (data.parts && Array.isArray(data.parts)) {
        for (const partData of data.parts) {
          try {
            const validatedPart = validatePartData(partData);
            if (validatedPart) {
              const newPart = await addPartOperation(orderRef.value.id, validatedPart);
              // Не нужно updateLocalParts - store уже обновляет локальное состояние
            } else {
              console.warn('Некорректные данные запчасти:', partData);
            }
          } catch (error) {
            console.error('Ошибка добавления запчасти:', error);
          }
        }
      }

      // Добавляем рекомендованные работы
      if (data.recommendedWorks && Array.isArray(data.recommendedWorks)) {
        for (const workData of data.recommendedWorks) {
          try {
            const validatedWork = validateWorkData(workData);
            if (validatedWork) {
              validatedWork.isRecomended = true;
              const newWork = await addWorkOperation(orderRef.value.id, validatedWork);
              // Не нужно updateLocalWorks - store уже обновляет локальное состояние
            } else {
              console.warn('Некорректные данные рекомендованной работы:', workData);
            }
          } catch (error) {
            console.error('Ошибка добавления рекомендованной работы:', error);
          }
        }
      }

      // Добавляем рекомендованные запчасти
      if (data.recommendedParts && Array.isArray(data.recommendedParts)) {
        for (const partData of data.recommendedParts) {
          try {
            const validatedPart = validatePartData(partData);
            if (validatedPart) {
              validatedPart.isRecomended = true;
              const newPart = await addPartOperation(orderRef.value.id, validatedPart);
              // Не нужно updateLocalParts - store уже обновляет локальное состояние
            } else {
              console.warn('Некорректные данные рекомендованной запчасти:', partData);
            }
          } catch (error) {
            console.error('Ошибка добавления рекомендованной запчасти:', error);
          }
        }
      }

      // Обновляем примечание, если оно пришло
      if (data.notes) {
        orderRef.value.notes = data.notes;
        try {
          await updateOrderNotes(orderRef.value.id, data.notes);
        } catch (error) {
          console.error('Ошибка обновления примечаний:', error);
        }
      }

      notifySuccess('Список работ успешно сгенерирован');
    } catch (error) {
      console.error('Ошибка при генерации списка работ:', error);
      notifyError('Ошибка при генерации списка работ', error.message);
    } finally {
      loading.value = false;
    }
  };

  return {
    // Состояние
    notesChanged,

    // Методы
    updateDescription,
    saveDescription,
    updateNotes,
    saveNotes,
    generateWorkList
  };
}
