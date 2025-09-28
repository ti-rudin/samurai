import { computed } from 'vue';
import { calculateWorksCost, calculatePartsCost, calculateTotalCost } from '../utils/orderCalculations';

/**
 * Композабл для финансовых расчетов заказа
 * @param {Object} orderRef - Реактивная ссылка на заказ
 * @returns {Object} Объект с вычисляемыми свойствами для финансовых расчетов
 */
export function useOrderCalculations(orderRef) {
  // Вычисляемые свойства для списков
  const recommendedWorks = computed(() => {
    if (!orderRef.value.works) return [];
    return orderRef.value.works.filter(work => work.isRecomended);
  });

  const nonRecommendedWorks = computed(() => {
    if (!orderRef.value.works) return [];
    return orderRef.value.works.filter(work => !work.isRecomended);
  });

  const parts = computed(() => {
    if (!orderRef.value.parts) return [];
    return orderRef.value.parts.filter(part => !part.isRecomended);
  });

  const recommendedParts = computed(() => {
    if (!orderRef.value.parts) return [];
    return orderRef.value.parts.filter(part => part.isRecomended);
  });

  // Вычисляемые свойства для финансов - основные списки
  const mainWorksCost = computed(() => calculateWorksCost(nonRecommendedWorks.value));
  const mainPartsCost = computed(() => calculatePartsCost(parts.value));
  const mainTotalCost = computed(() => mainWorksCost.value + mainPartsCost.value);

  // Вычисляемые свойства для финансов - рекомендуемые списки
  const recommendedWorksCost = computed(() => calculateWorksCost(recommendedWorks.value));
  const recommendedPartsCost = computed(() => calculatePartsCost(recommendedParts.value));
  const recommendedTotalCost = computed(() => recommendedWorksCost.value + recommendedPartsCost.value);

  // Общие итоги
  const worksCost = computed(() => calculateWorksCost(orderRef.value.works));
  const partsCost = computed(() => calculatePartsCost(orderRef.value.parts));
  const totalCost = computed(() => calculateTotalCost(orderRef.value.works, orderRef.value.parts));

  return {
    // Вычисляемые свойства для списков
    recommendedWorks,
    nonRecommendedWorks,
    parts,
    recommendedParts,

    // Вычисляемые свойства для финансов
    mainWorksCost,
    mainPartsCost,
    mainTotalCost,
    recommendedWorksCost,
    recommendedPartsCost,
    recommendedTotalCost,
    worksCost,
    partsCost,
    totalCost
  };
}
