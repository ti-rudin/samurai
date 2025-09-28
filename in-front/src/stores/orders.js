import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/strapi';
import { transformOrderData } from '../utils/dataTransformers';
import { useWorkStore } from './workStore';
import { usePartStore } from './partStore';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([]);
  const workStore = useWorkStore();
  const partStore = usePartStore();

  // Загрузка заказа по ID
  async function fetchOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`, {
        params: {
          populate: {
            client: true,
            car: true,
            works: {
              populate: {
                executor: true
              }
            },
            parts: true
          }
        }
      });
      if (!response.data?.data) {
        throw new Error('Некорректный ответ API: отсутствуют данные');
      }

      const transformedOrder = transformOrderData(response.data);
      return transformedOrder;
    } catch (error) {
      throw error;
    }
  }

  // Загрузка всех заказов
  async function fetchOrders() {
    try {
      console.log('[ordersStore] fetchOrders called');
      const response = await api.get('/orders', {
        params: {
          populate: {
            client: true,
            car: true,
            works: {
              populate: {
                executor: true
              }
            },
            parts: true
          }
        }
      });
      console.log('[ordersStore] fetchOrders response data length:', response.data?.data?.length);
      console.log('[ordersStore] First order works:', response.data?.data?.[0]?.attributes?.works?.data);

      if (!response.data?.data) {
        throw new Error('Некорректный ответ API: отсутствуют данные');
      }

      // Сортировка заказов по дате создания в порядке убывания (новые сначала)
      const transformedOrders = response.data.data.map(transformOrderData);
      console.log('[ordersStore] First transformed order works:', transformedOrders[0]?.works);
      orders.value = transformedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('[ordersStore] fetchOrders error:', error);
      throw error;
    }
  }

  // Добавление нового заказа
  async function addOrder(order) {
    try {
      const orderData = {
        data: {
          client: order.clientId,
          car: order.carId,
          orderstatus: 'new',
          description: order.description || '',
          estimatedCost: order.estimatedCost || 0,
          finalCost: order.finalCost || 0,
          notes: order.notes || '',
        }
      };
      const response = await api.post('/orders', orderData);
      await fetchOrders();
      return transformOrderData(response.data);
    } catch (error) {
      throw error;
    }
  }

  // Обновление заказа
  async function updateOrder(id, updatedOrder) {
    try {
      // Сначала получаем текущий заказ с полными данными
      const currentOrder = await fetchOrderById(id);
      
      // Создаем объект для отправки на сервер, включая все необходимые поля
      const orderData = {
        data: {
          client: updatedOrder.clientId || currentOrder.clientId,
          car: updatedOrder.carId || currentOrder.carId,
          orderstatus: updatedOrder.orderstatus || currentOrder.orderstatus || 'new',
          description: updatedOrder.description || currentOrder.description || '',
          estimatedCost: updatedOrder.estimatedCost || currentOrder.estimatedCost || 0,
          finalCost: updatedOrder.finalCost || currentOrder.finalCost || 0,
          notes: updatedOrder.notes || currentOrder.notes || '',
          // Сохраняем связи с работами и запчастями
          works: currentOrder.works.map(work => work.id),
          parts: currentOrder.parts.map(part => part.id)
        }
      };
      
      const response = await api.put(`/orders/${id}`, orderData);
      
      // Загружаем обновленный заказ с полными данными (работами и запчастями)
      const fullUpdatedOrder = await fetchOrderById(id);
      
      // Обновляем заказ в локальном хранилище
      const orderIndex = orders.value.findIndex(o => o.id === id);
      if (orderIndex !== -1) {
        orders.value[orderIndex] = fullUpdatedOrder;
      }
      
      return fullUpdatedOrder;
    } catch (error) {
      throw error;
    }
  }

  // Обновление статуса заказа
  async function updateOrderStatus(id, status) {
    try {
      // Сначала получаем текущий заказ с полными данными
      const currentOrder = await fetchOrderById(id);
      
      // Создаем объект для отправки на сервер, включая все необходимые поля
      const orderData = {
        data: {
          client: currentOrder.clientId,
          car: currentOrder.carId,
          orderstatus: status,
          description: currentOrder.description,
          estimatedCost: currentOrder.estimatedCost,
          finalCost: currentOrder.finalCost,
          notes: currentOrder.notes,
          // Сохраняем связи с работами и запчастями
          works: currentOrder.works.map(work => work.id),
          parts: currentOrder.parts.map(part => part.id)
        }
      };
      
      const response = await api.put(`/orders/${id}`, orderData);
      
      // Загружаем обновленный заказ с полными данными (работами и запчастями)
      const updatedOrder = await fetchOrderById(id);
      
      const orderIndex = orders.value.findIndex(o => o.id === id);
      if (orderIndex !== -1) {
        orders.value[orderIndex] = updatedOrder;
      } else {
        orders.value.push(updatedOrder);
      }
      
      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }

  // Удаление заказа
  async function removeOrder(id) {
    try {
      const response = await api.delete(`/orders/${id}`);
      if (response.status === 200 || response.status === 204) {
        await fetchOrders();
        return true;
      }
      throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
    } catch (error) {
      throw error;
    }
  }

  // Добавление работы к заказу
  async function addWork(orderId, workData) {
    try {
      
      const addedWork = await workStore.addWork(orderId, workData);

      // Обновляем заказ, к которому относится работа
      const updatedOrder = await fetchOrderById(orderId);
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex] = updatedOrder;
      }

      return addedWork;
    } catch (error) {
      throw error;
    }
  }

  // Обновление работы
  async function updateWork(workId, updatedData) {
    try {
      const updatedWork = await workStore.updateWork(workId, updatedData);
      
      // Обновляем заказ, к которому относится работа
      if (updatedData.order) {
        const updatedOrder = await fetchOrderById(updatedData.order);
        const orderIndex = orders.value.findIndex(o => o.id === updatedData.order);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = updatedOrder;
        }
      }
      
      return updatedWork;
    } catch (error) {
      throw error;
    }
  }

  // Удаление работы
  async function removeWork(workId) {
    try {
      await workStore.removeWork(workId);
      
      // Находим заказ, к которому относится работа, и обновляем его локально
      const orderWithWork = orders.value.find(order => 
        order.works && order.works.some(work => work.id === workId)
      );
      
      if (orderWithWork) {
        orderWithWork.works = orderWithWork.works.filter(work => work.id !== workId);
        const orderIndex = orders.value.findIndex(o => o.id === orderWithWork.id);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = { ...orderWithWork };
        }
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Массовое удаление работ
  async function batchDeleteWorks(workIds) {
    try {
      return await workStore.batchDeleteWorks(workIds);
    } catch (error) {
      throw error;
    }
  }

  // Массовое назначение исполнителя
  async function batchAssignExecutor(workIds, executorId, executorPercentage = null) {
    try {
      console.log('[ordersStore] batchAssignExecutor called with:', { workIds, executorId, executorPercentage });

      const result = await workStore.batchAssignExecutor(workIds, executorId, executorPercentage);
      console.log('[ordersStore] workStore.batchAssignExecutor result:', result);

      // Обновляем заказы, к которым относятся работы
      // Получаем orderId из результатов работы workStore
      const affectedOrderIds = new Set();

      // Получаем работы для определения orderId
      for (const workId of workIds) {
        // Находим заказ, содержащий эту работу
        const orderWithWork = orders.value.find(order =>
          order.works && order.works.some(work => work.id === workId)
        );
        if (orderWithWork) {
          affectedOrderIds.add(orderWithWork.id);
        }
      }

      console.log('[ordersStore] Affected order IDs:', Array.from(affectedOrderIds));

      // Обновляем найденные заказы
      for (const orderId of affectedOrderIds) {
        console.log(`[ordersStore] Fetching updated order ${orderId}`);
        const updatedOrder = await fetchOrderById(orderId);
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = updatedOrder;
          console.log(`[ordersStore] Updated order ${orderId} in local store`);
        }
      }

      // Также обновляем все заказы, чтобы быть уверенными
      console.log('[ordersStore] Refreshing all orders');
      await fetchOrders();

      return result;
    } catch (error) {
      console.error('[ordersStore] batchAssignExecutor error:', error);
      throw error;
    }
  }

  // Добавление запчасти к заказу
  async function addPart(orderId, partData) {
    try {
      const addedPart = await partStore.addPart(orderId, partData);
      
      // Обновляем заказ, к которому относится запчасть
      const updatedOrder = await fetchOrderById(orderId);
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex] = updatedOrder;
      }
      
      return addedPart;
    } catch (error) {
      throw error;
    }
  }

  // Обновление запчасти
  async function updatePart(partId, partData) {
    try {
      const result = await partStore.updatePart(partId, partData);
      
      // Обновляем заказ, к которому относится запчасть
      if (partData.orderId) {
        const updatedOrder = await fetchOrderById(partData.orderId);
        const orderIndex = orders.value.findIndex(o => o.id === partData.orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = updatedOrder;
        }
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Удаление запчасти
  async function removePart(partId) {
    try {
      await partStore.removePart(partId);
      
      // Находим заказ, к которому относится запчасть, и обновляем его локально
      const orderWithPart = orders.value.find(order => 
        order.parts && order.parts.some(part => part.id === partId)
      );
      
      if (orderWithPart) {
        orderWithPart.parts = orderWithPart.parts.filter(part => part.id !== partId);
        const orderIndex = orders.value.findIndex(o => o.id === orderWithPart.id);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = { ...orderWithPart };
        }
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  return {
    orders,
    fetchOrders,
    addOrder,
    updateOrder,
    updateOrderStatus,
    removeOrder,
    getOrderById: (id) => orders.value.find(o => o.id === id),
    fetchOrderById,

    addWork,
    updateWork,
    removeWork,
    batchDeleteWorks,
    batchAssignExecutor,
    addPart,
    updatePart,
    removePart
  };
});
