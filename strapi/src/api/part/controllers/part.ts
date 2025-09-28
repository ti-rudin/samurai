/**
 * part controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::part.part', ({ strapi }) => ({
  async delete(ctx) {
    const { id } = ctx.params;
    console.log(`[Part Controller] Удаление запчасти с ID: ${id}`);
    
    try {
      await strapi.entityService.delete('api::part.part', id);
      console.log(`[Part Controller] Запчасть с ID ${id} успешно удалена`);
      
      // Возвращаем успешный ответ без содержимого
      ctx.status = 204;
      ctx.body = null;
      return;
    } catch (error) {
      console.error(`[Part Controller] Ошибка удаления запчасти ${id}:`, error);
      ctx.status = error.status || 500;
      ctx.body = { error: 'Ошибка при удалении запчасти' };
      return;
    }
  }
}));
