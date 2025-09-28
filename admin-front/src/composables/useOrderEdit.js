import { ref, computed, watch, isRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useOrderOperations } from './useOrderOperations';
import { useOrderData } from './useOrderData';
import { useNotifications } from './useNotifications';
import { useOrdersStore } from '../stores/orders';
import { useOrderNotes } from './useOrderNotes';
import { useOrderWorks } from './useOrderWorks';
import { useOrderParts } from './useOrderParts';
import { useOrderCalculations } from './useOrderCalculations';
import { useOrderRecommendations } from './useOrderRecommendations';

/**
 * Композабл для редактирования заказов с улучшенной архитектурой
 * @param {string} orderId - ID заказа (опционально, будет взят из route если не передан)
 * @returns {Object} Объект с данными и методами для редактирования заказа
 */
export function useOrderEdit(orderId) {
  // Router
  const router = useRouter();
  const route = useRoute();

  // Получаем orderId из параметра или из route
  const actualOrderId = computed(() => {
    if (orderId) return isRef(orderId) ? orderId.value : orderId;
    return route.params.id;
  });

  // Основное состояние
  const order = ref({});
  const executors = ref([]);
  const loading = ref(false);
  const isGeneratingWorkList = ref(false);

  // Композаблы для работы с данными
  const { loadOrder, updateOrderDescription, updateOrderNotes } = useOrderOperations();
  const { loadClients, loadCars, loadExecutors: loadExecutorsData } = useOrderData();
  
  // Функция для загрузки исполнителей
  const loadExecutors = async () => {
    try {
      const executorsData = await loadExecutorsData();
      return executorsData;
    } catch (error) {
      console.error('Ошибка при загрузке исполнителей:', error);
      return [];
    }
  };
  const { notifyError, notifySuccess, notifyInfo } = useNotifications();

  // Получаем orders store для отслеживания изменений
  const ordersStore = useOrdersStore();

  // Используем специализированные composables
  const orderNotes = useOrderNotes(order);
  const orderWorks = useOrderWorks(order);
  const orderParts = useOrderParts(order);
  const calculations = useOrderCalculations(order);
  const recommendations = useOrderRecommendations(order, calculations);

  // Функции обновления локального состояния из composables
  const { updateLocalWorks } = orderWorks;
  const { updateLocalParts } = orderParts;

  // Инициализация заказа (перемещена выше watcher'ов)
  const initializeOrder = async () => {
    try {
      // Сбрасываем состояние генерации при инициализации
      isGeneratingWorkList.value = false;
      loading.value = true;

      if (actualOrderId.value) {
        // Проверяем, был ли создан новый заказ
        const newOrderCreated = sessionStorage.getItem('newOrderCreated');
        const forceReload = sessionStorage.getItem('forceOrderReload');

        if ((newOrderCreated && newOrderCreated === actualOrderId.value) || (forceReload && forceReload === actualOrderId.value)) {
          // Это новый заказ, созданный на основании рекомендаций
          
          sessionStorage.removeItem('newOrderCreated');
          sessionStorage.removeItem('forceOrderReload');

          // Принудительно обновляем orders store
          const ordersStore = useOrdersStore();
          await ordersStore.fetchOrders();

          // Ждем немного для синхронизации
          await new Promise(resolve => setTimeout(resolve, 100));

          // Дополнительная проверка - если заказ все еще не загружен корректно
          const checkOrder = await ordersStore.fetchOrderById(actualOrderId.value);
          if (!checkOrder || !checkOrder.works || !checkOrder.parts) {
            console.warn('Заказ не загружен корректно, пробуем еще раз...');
            await new Promise(resolve => setTimeout(resolve, 200));
            order.value = await loadOrder(actualOrderId.value);
          }
        }

        // Принудительно перезагружаем заказ с сервера
       
        order.value = await loadOrder(actualOrderId.value);
        await loadClients();
        await loadCars();
        executors.value = await loadExecutors();
      }
    } catch (error) {
      notifyError('Ошибка при загрузке данных заказа', error.message);
    } finally {
      loading.value = false;
    }
  };

  // Watch для отслеживания изменений в orders store
  watch(
    () => ordersStore.orders,
    async (newOrders) => {
      if (actualOrderId.value && newOrders.length > 0) {
        const currentOrder = newOrders.find(o => o.id === parseInt(actualOrderId.value));
        if (currentOrder && (!order.value.id || currentOrder.updatedAt !== order.value.updatedAt)) {
         
          try {
            order.value = await loadOrder(actualOrderId.value);
          } catch (error) {
            console.error('Ошибка при обновлении заказа из store:', error);
          }
        }
      }
    },
    { deep: true }
  );

  // Watch для отслеживания изменений route.params.id (при переходе между заказами)
  watch(
    () => route.params.id,
    async (newOrderId, oldOrderId) => {
      if (newOrderId && newOrderId !== oldOrderId) {
       
        // Принудительно очищаем старое состояние
        order.value = {};
        executors.value = [];
        // Загружаем новый заказ
        await initializeOrder();

        // Дополнительно загружаем заказ напрямую из API для надежности
        try {
          
          const freshOrder = await ordersStore.fetchOrderById(newOrderId);
          if (freshOrder) {
            order.value = freshOrder;
            
          }
        } catch (error) {
          console.error('Ошибка при дополнительной загрузке заказа:', error);
        }
      }
    },
    { immediate: true }
  );

  // Watch для отслеживания изменений orderId (при переходе между заказами)
  watch(
    () => orderId,
    async (newOrderId, oldOrderId) => {
      if (newOrderId && newOrderId !== oldOrderId) {
        
        order.value = {};
        executors.value = [];
        // Загружаем новый заказ
        await initializeOrder();
      }
    },
    { immediate: false }
  );

  // Используем вычисляемые свойства из useOrderCalculations
  const {
    recommendedWorks,
    nonRecommendedWorks,
    parts,
    recommendedParts,
    mainWorksCost,
    mainPartsCost,
    mainTotalCost,
    recommendedWorksCost,
    recommendedPartsCost,
    recommendedTotalCost,
    worksCost,
    partsCost,
    totalCost
  } = calculations;

  // Используем обработчики из useOrderWorks и useOrderParts
  const {
    handleAddWork,
    handleEditWork: originalHandleEditWork,
    handleDeleteWork,
    handleBatchDelete,
    handleBatchAssign
  } = orderWorks;

  // Обертка для handleEditWork с логированием
  const handleEditWork = (workData) => {
   
    return originalHandleEditWork(workData);
  };

  const {
    handleAddPart,
    handleEditPart,
    handleDeletePart,
    handleBatchDeleteParts
  } = orderParts;

  // Используем состояния и методы для рекомендованных работ из useOrderWorks
  const {
    isRecommendedWorkModalOpen,
    currentRecommendedWork,
    handleAddRecommendedWork,
    handleEditRecommendedWork,
    handleDeleteRecommendedWork,
    onSaveRecommendedWork,
    closeRecommendedWorkModal
  } = orderWorks;

  // Используем состояния и методы для рекомендованных запчастей из useOrderParts
  const {
    isRecommendedPartModalOpen,
    currentRecommendedPart,
    handleAddRecommendedPart,
    handleEditRecommendedPart,
    handleDeleteRecommendedPart,
    onSaveRecommendedPart,
    closeRecommendedPartModal
  } = orderParts;

  // Используем методы для описания и примечаний из useOrderNotes
  const {
    updateDescription,
    saveDescription,
    updateNotes,
    saveNotes,
    notesChanged,
    generateWorkList: originalGenerateWorkList
  } = orderNotes;

  // Обертка для generateWorkList с передачей параметров
  const generateWorkList = async () => {
    // Проверяем, не выполняется ли уже генерация
    if (isGeneratingWorkList.value) {
      console.log('Генерация уже выполняется, пропускаем повторный вызов');
      return;
    }

    try {
      isGeneratingWorkList.value = true;

      // Создаем обертки для функций, которые будут принимать правильные параметры
      const addWorkOperation = async (orderId, workData) => {
        return await orderWorks.handleAddWork(workData);
      };
      const addPartOperation = async (orderId, partData) => {
        return await orderParts.handleAddPart(partData);
      };

      await originalGenerateWorkList(
        addWorkOperation,
        null, // updateLocalWorks больше не нужен
        addPartOperation,
        null, // updateLocalParts больше не нужен
        isGeneratingWorkList
      );
    } catch (error) {
      console.error('Ошибка в generateWorkList:', error);
      throw error;
    } finally {
      isGeneratingWorkList.value = false;
    }
  };

  // Используем метод для создания заказа на основании рекомендаций из useOrderRecommendations
  const {
    handleCreateOrderFromRecommendations,
    creatingOrderFromRecommendations
  } = recommendations;



  return {
    // Состояние
    order,
    executors,
    loading,
    isGeneratingWorkList,
    notesChanged,
    isRecommendedPartModalOpen,
    currentRecommendedPart,
    isRecommendedWorkModalOpen,
    currentRecommendedWork,
    creatingOrderFromRecommendations,

    // Вычисляемые свойства
    worksCost,
    partsCost,
    totalCost,
    mainWorksCost,
    mainPartsCost,
    mainTotalCost,
    recommendedWorksCost,
    recommendedPartsCost,
    recommendedTotalCost,
    recommendedWorks,
    nonRecommendedWorks,
    parts,
    recommendedParts,

    // Методы для работ
    handleAddWork,
    handleEditWork,
    handleDeleteWork,
    handleBatchDelete,
    handleBatchAssign,

    // Методы для запчастей
    handleAddPart,
    handleEditPart,
    handleDeletePart,
    handleBatchDeleteParts,

    // Методы для рекомендованных элементов
    handleAddRecommendedWork,
    handleEditRecommendedWork,
    handleDeleteRecommendedWork,
    handleAddRecommendedPart,
    handleEditRecommendedPart,
    handleDeleteRecommendedPart,
    onSaveRecommendedWork,
    closeRecommendedWorkModal,
    onSaveRecommendedPart,
    closeRecommendedPartModal,

    // Методы для описания и примечаний
    updateDescription,
    saveDescription,
    updateNotes,
    saveNotes,
    generateWorkList,

    // Метод для создания заказа на основании рекомендаций
    handleCreateOrderFromRecommendations,

    // Инициализация
    initializeOrder
  };
}
