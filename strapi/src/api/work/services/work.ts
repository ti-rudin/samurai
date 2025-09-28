/**
 * work service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::work.work', ({ strapi }) => ({
  async find(params) {
    console.log('Service find with params:', params);
    return super.find(params);
  },

  async findOne(id, params) {
    console.log('Service findOne with id:', id, 'params:', params);
    return super.findOne(id, params);
  },

  async create(params) {
    console.log('Service create with params:', params);
    return super.create(params);
  },

  async update(id, params) {
    console.log('Service update with id:', id, 'params:', params);
    console.log('Data being updated:', params.data);
    try {
      // Используем entityService напрямую для лучшего контроля над обновлением
      const updateData: any = { ...params.data };

      // НЕ обрабатываем связи executor и order - они уже правильно сформированы в контроллере
      // executor должен быть { set: [...] } для manyToMany
      // order должен быть просто ID для manyToOne

      console.log('Processed update data:', updateData);

      const result: any = await strapi.entityService.update('api::work.work', id, {
        data: updateData,
        populate: {
          executor: {
            fields: ['id', 'username', 'email']
          },
          order: {
            fields: ['id', 'orderstatus']
          }
        }
      });

      console.log('Entity service update result:', result);

      // Преобразуем данные исполнителя, если нужно
      if (result && result.executor) {
        console.log('Executor data in result:', result.executor);

        // Если executor - это объект с data (Strapi v4 формат), преобразуем его
        if (result.executor.data) {
          result.executor = {
            id: result.executor.data.id,
            ...result.executor.data.attributes
          };
        }
      }

      return result;
    } catch (error) {
      console.error('Error in service update:', error);
      throw error;
    }
  },

  async delete(id) {
    console.log('Service delete with id:', id);
    return super.delete(id);
  }
}));
