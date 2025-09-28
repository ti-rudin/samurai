/**
 * order router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::order.order', {
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    findOne: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});
