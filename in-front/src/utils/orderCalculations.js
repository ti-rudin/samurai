/**
 * Расчет стоимости работ
 * @param {Array} works - массив работ
 * @returns {number} общая стоимость работ
 */
export function calculateWorksCost(works) {
  if (!works || works.length === 0) {
    return 0;
  }
  return works.reduce((sum, work) => sum + (Number(work.cost) || 0), 0);
}

/**
 * Расчет стоимости запчастей
 * @param {Array} parts - массив запчастей
 * @returns {number} общая стоимость запчастей
 */
export function calculatePartsCost(parts) {
  if (!parts || parts.length === 0) {
    return 0;
  }
  return parts.reduce((sum, part) => {
    const quantity = Number(part.quantity) || 1;
    const price = Number(part.price) || 0;
    return sum + (quantity * price);
  }, 0);
}

/**
 * Расчет общей стоимости (работы + запчасти)
 * @param {Array} works - массив работ
 * @param {Array} parts - массив запчастей
 * @returns {number} общая стоимость
 */
export function calculateTotalCost(works, parts) {
  const worksCost = calculateWorksCost(works);
  const partsCost = calculatePartsCost(parts);
  return worksCost + partsCost;
}

/**
 * Получение текста статуса запчасти
 * @param {string} status - код статуса
 * @returns {string} текст статуса
 */
export function getPartStatusText(status) {
  const statuses = {
    'pending_from_client': 'Ожидаем от клиента',
    'need_to_order': 'Надо заказать',
    'ordered': 'Заказано',
    'onbase': 'На базе'
  };
  return statuses[status] || 'Неизвестный статус';
}

/**
 * Фильтрация рекомендованных работ
 * @param {Array} works - массив работ
 * @returns {Array} рекомендованные работы
 */
export function filterRecommendedWorks(works) {
  if (!works) return [];
  console.log('Фильтрация рекомендованных работ. Исходные данные:', works);
  const recommended = works.filter(work => work.isRecomended);
  console.log('Рекомендованные работы:', recommended);
  return recommended;
}

/**
 * Фильтрация нерекомендованных работ
 * @param {Array} works - массив работ
 * @returns {Array} нерекомендованные работы
 */
export function filterNonRecommendedWorks(works) {
  if (!works) return [];
  console.log('Фильтрация нерекомендованных работ. Исходные данные:', works);
  const nonRecommended = works.filter(work => !work.isRecomended);
  console.log('Нерекомендованные работы:', nonRecommended);
  return nonRecommended;
}

/**
 * Фильтрация рекомендованных запчастей
 * @param {Array} parts - массив запчастей
 * @returns {Array} рекомендованные запчасти
 */
export function filterRecommendedParts(parts) {
  if (!parts) return [];
  console.log('Фильтрация рекомендованных запчастей. Исходные данные:', parts);
  const recommended = parts.filter(part => part.isRecomended);
  console.log('Рекомендованные запчасти:', recommended);
  return recommended;
}

/**
 * Фильтрация используемых запчастей
 * @param {Array} parts - массив запчастей
 * @returns {Array} используемые запчасти
 */
export function filterUsedParts(parts) {
  if (!parts) return [];
  console.log('Фильтрация используемых запчастей. Исходные данные:', parts);
  const used = parts.filter(part => !part.isRecomended);
  console.log('Используемые запчасти:', used);
  return used;
}
