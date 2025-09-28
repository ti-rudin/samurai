/**
 * work controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::work.work', ({ strapi }) => ({
  async find(ctx) {
    const { results, pagination } = await strapi.service('api::work.work').find(ctx.query);
    return this.transformResponse(results, { pagination });
  },

async findOne(ctx) {
    console.log('Запрос на получение работы с ID:', ctx.params.id);
    const { id } = ctx.params;
    try {
      const entity = await strapi.service('api::work.work').findOne(id, ctx.query);
      console.log('Полученные данные о работе:', entity);
      if (!entity) {
        console.log('Работа не найдена в сервисе');
        ctx.status = 404;
        return { data: null, error: { status: 404, name: 'NotFoundError', message: 'Not Found', details: {} } };
      }
      return this.transformResponse(entity);
    } catch (error) {
      console.error('Ошибка при получении работы:', error);
      ctx.status = 404;
      return { data: null, error: { status: 404, name: 'NotFoundError', message: 'Not Found', details: {} } };
    }
  },

  async create(ctx) {
    const entity = await strapi.service('api::work.work').create(ctx.request.body);
    return this.transformResponse(entity);
  },

  async update(ctx) {
    console.log('Запрос на обновление работы с ID:', ctx.params.id);
    console.log('Данные для обновления:', ctx.request.body);
    const { id } = ctx.params;
    try {
      const entity = await strapi.service('api::work.work').update(id, ctx.request.body);
      console.log('Успешно обновлена работа:', entity);
      if (!entity) {
        console.log('Работа не найдена в сервисе');
        ctx.status = 404;
        return { data: null, error: { status: 404, name: 'NotFoundError', message: 'Not Found', details: {} } };
      }
      return this.transformResponse(entity);
    } catch (error) {
      console.error('Ошибка при обновлении работы:', error);
      ctx.status = 404;
      return { data: null, error: { status: 404, name: 'NotFoundError', message: 'Not Found', details: {} } };
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;
    console.log(`[Work Controller] Deleting work with ID: ${id}`);
    
    try {
      await strapi.entityService.delete('api::work.work', id);
      console.log(`[Work Controller] Successfully deleted work ${id}`);
      
      // Возвращаем успешный ответ без содержимого
      ctx.status = 204;
      ctx.body = null;
      return;
    } catch (error) {
      console.error(`[Work Controller] Error deleting work ${id}:`, error);
      ctx.status = error.status || 500;
      ctx.body = { error: 'Error deleting work' };
      return;
    }
  }
}));
