import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  'api::order.order',
  ({ strapi }) => ({
    // Custom findOne with populate
    async findOne(ctx) {
      const { id } = ctx.params;
      const entity = await strapi.entityService.findOne('api::order.order', id, {
        populate: {
          client: true,
          car: true,
          works: {
            populate: {
              executor: true
            }
          },
          parts: true // Добавлено поле parts
        }
      });
      return this.transformResponse(entity);
    },

    async update(ctx) {
      try {
        const { id } = ctx.params;
        const requestData = ctx.request.body;

        // Validate required fields
        if (!requestData || !requestData.data) {
          return ctx.badRequest('Invalid request data');
        }

        // Extract and transform data
        const { data } = requestData;
        const updateData = {
          orderstatus: data.orderstatus,
          description: data.description || '',
          estimatedCost: data.estimatedCost || 0,
          finalCost: data.finalCost || 0,
          notes: data.notes || '',
          client: data.clientId,
          car: data.carId,
          works: data.works || [],
          parts: data.parts || [] // Добавлено поле parts
        };

        // Update the order
        const updatedOrder = await strapi.entityService.update(
          'api::order.order',
          id,
          { data: updateData as any }
        );

        return this.transformResponse(updatedOrder);
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    },

    async delete(ctx) {
      try {
        const { id } = ctx.params
        console.log('Deleting order with ID:', id)
        
        // Check if order exists
        const order = await strapi.entityService.findOne('api::order.order', id)
        if (!order) {
          return ctx.notFound('Order not found')
        }

        // Delete related works first using query API
        await strapi.db.query('api::work.work').deleteMany({
          where: { order: id }
        })

        // Delete the order
        const result = await strapi.entityService.delete('api::order.order', id)
        console.log('Successfully deleted order:', id)
        
        return this.transformResponse(result);
      } catch (error) {
        console.error('Error deleting order:', error)
        throw error
      }
    }
  })
)
