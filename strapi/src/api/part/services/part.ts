/**
 * part service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::part.part', ({ strapi }) => ({
  async delete(id) {
    console.log(`[Part Service] Удаление запчасти с ID: ${id}`);
    return super.delete(id);
  }
}));
