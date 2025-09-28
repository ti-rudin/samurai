/**
 * Утилиты для работы со статусами работ
 */

/**
 * Получает текстовое представление статуса
 * @param {String} status - Статус работы
 * @returns {String} Текстовое представление статуса
 */
export function getStatusText(status) {
  const statuses = {
    'pending': 'Новая',
    'in_progress': 'В работе',
    'completed': 'Завершена'
  }
  return statuses[status] || status
}

/**
 * Получает CSS класс для бейджа статуса
 * @param {String} status - Статус работы
 * @returns {String} CSS класс для бейджа
 */
export function getStatusBadgeClass(status) {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

/**
 * Получает все доступные статусы
 * @returns {Array} Массив объектов со статусами
 */
export function getAllStatuses() {
  return [
    { value: 'pending', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершена' }
  ]
}
