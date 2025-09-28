import { defineStore } from 'pinia';
import api from '../api/strapi';
import { transformPartData } from '../utils/dataTransformers';

export const usePartStore = defineStore('parts', () => {
  /**
   * Добавление запчасти к заказу
   */
  async function addPart(orderId, partData) {
    try {
      const response = await api.post('/parts', {
        data: {
          number: partData.number,
          name: partData.name,
          quantity: partData.quantity,
          price: partData.price,
          partstatus: partData.partstatus || 'pending_from_client',
          isRecomended: partData.isRecomended || false,
          order: orderId
        }
      });
      
      // Преобразуем данные запчасти
      const addedPart = transformPartData(response.data.data);
      return addedPart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновление запчасти
   */
  async function updatePart(partId, partData) {
    try {
      // Обрабатываем разные форматы передачи order (может быть объектом или ID)
      let orderId = partData.orderId;
      if (!orderId && partData.order && typeof partData.order === 'object') {
        orderId = partData.order.id;
      } else if (!orderId && partData.order) {
        orderId = partData.order;
      }
      
      const response = await api.put(`/parts/${partId}`, {
        data: {
          number: partData.number,
          name: partData.name,
          quantity: partData.quantity,
          price: partData.price,
          partstatus: partData.partstatus,
          isRecomended: partData.isRecomended || false,
          order: orderId
        }
      });
      
      // Преобразуем данные запчасти
      const updatedPart = transformPartData(response.data.data);
      return updatedPart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удаление запчасти
   */
  async function removePart(partId) {
    try {
      const response = await api.delete(`/parts/${partId}`);
      
      if (response.status === 200 || response.status === 204) {
        return true;
      } else {
        throw new Error(`Ошибка удаления запчасти: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Массовое удаление запчастей
   */
  async function batchDeleteParts(partIds) {
    try {
      const results = await Promise.all(
        partIds.map(partId => removePart(partId))
      );
      return results;
    } catch (error) {
      throw error;
    }
  }

  return {
    addPart,
    updatePart,
    removePart,
    batchDeleteParts
  };
});
