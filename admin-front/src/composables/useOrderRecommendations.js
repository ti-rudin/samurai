import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '../stores/orders';
import { useNotifications } from './useNotifications';

/**
 * Композабл для работы с рекомендациями и созданием заказов
 * @param {Object} orderRef - Реактивная ссылка на заказ
 * @param {Object} calculations - Вычисляемые свойства для финансовых расчетов
 * @returns {Object} Объект с методами для работы с рекомендациями
 */
export function useOrderRecommendations(orderRef, calculations) {
  const router = useRouter();
  const ordersStore = useOrdersStore();
  const { notifySuccess, notifyError } = useNotifications();

  // Состояние
  const creatingOrderFromRecommendations = ref(false);

  // Создание нового заказа на основании рекомендаций
  const handleCreateOrderFromRecommendations = async () => {
    try {
      creatingOrderFromRecommendations.value = true;

      // Получаем доступ к orders store
      const ordersStore = useOrdersStore();

      // Создаем новый заказ с данными клиента и автомобиля
      const newOrderData = {
        clientId: orderRef.value.clientId,
        carId: orderRef.value.carId,
        description: '',
        notes: `Создано на основании рекомендаций из заказа #${orderRef.value.id}`,
        estimatedCost: calculations.recommendedTotalCost.value,
        finalCost: 0
      };

      console.log('Создаем новый заказ с данными:', newOrderData);
      const newOrder = await ordersStore.addOrder(newOrderData);
      console.log('Новый заказ создан:', newOrder);

      // Переносим рекомендованные работы в новый заказ (делаем их основными)
      if (calculations.recommendedWorks.value.length > 0) {
        console.log('Переносим рекомендованные работы...');
        for (const work of calculations.recommendedWorks.value) {
          try {
            const addedWork = await ordersStore.addWork(newOrder.id, {
              ...work,
              isRecomended: false,
              orderId: newOrder.id
            });
            console.log('Добавлена работа:', addedWork);
          } catch (error) {
            console.error('Ошибка при переносе работы:', error);
          }
        }
      }

      // Переносим рекомендованные запчасти в новый заказ (делаем их основными)
      if (calculations.recommendedParts.value.length > 0) {
        console.log('Переносим рекомендованные запчасти...');
        for (const part of calculations.recommendedParts.value) {
          try {
            const addedPart = await ordersStore.addPart(newOrder.id, {
              ...part,
              isRecomended: false,
              orderId: newOrder.id
            });
            console.log('Добавлена запчасть:', addedPart);
          } catch (error) {
            console.error('Ошибка при переносе запчасти:', error);
          }
        }
      }

      notifySuccess(`Новый заказ #${newOrder.id} успешно создан`);

      // Ждем обновления данных в store перед переходом
      console.log('Ждем обновления store...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Реактивный переход на новый заказ без перезагрузки страницы
      console.log('Переходим на новый заказ:', newOrder.id);
      await router.push(`/orders/${newOrder.id}/edit`);

    } catch (error) {
      console.error('Ошибка при создании заказа на основании рекомендаций:', error);
      notifyError('Ошибка при создании нового заказа', error.message);
    } finally {
      creatingOrderFromRecommendations.value = false;
    }
  };

  return {
    // Состояние
    creatingOrderFromRecommendations,

    // Методы
    handleCreateOrderFromRecommendations
  };
}
