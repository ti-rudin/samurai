/**
 * Форматирование даты
 * @param {string} dateString - строка с датой
 * @param {boolean} dateOnly - только дата без времени
 * @returns {string} отформатированная дата
 */
export function formatDate(dateString, dateOnly = false) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  if (dateOnly) {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Получение текущей даты в формате для отображения
 * @returns {string} текущая дата
 */
export function getCurrentDate() {
  return formatDate(new Date().toISOString());
}

/**
 * Проверка, является ли дата валидной
 * @param {string} dateString - строка с датой
 * @returns {boolean} true если дата валидна
 */
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
