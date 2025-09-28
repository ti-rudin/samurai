import { ref, reactive } from 'vue';

// Глобальное состояние уведомлений
const notifications = ref([]);
let notificationId = 0;

/**
 * Композабл для управления уведомлениями
 * @returns {Object} Объект с методами и состоянием уведомлений
 */
export function useNotifications() {
  /**
   * Добавляет новое уведомление
   * @param {Object} notification - Объект уведомления
   * @param {string} notification.type - Тип уведомления (success, error, warning, info)
   * @param {string} notification.title - Заголовок уведомления
   * @param {string} [notification.message] - Сообщение уведомления
   * @param {number} [notification.duration=5000] - Длительность показа в мс
   */
  const addNotification = (notification) => {
    const id = ++notificationId;
    const duration = notification.duration || 5000;
    
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      duration
    };

    notifications.value.push(newNotification);

    // Автоматическое удаление через заданное время
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  /**
   * Удаляет уведомление по ID
   * @param {number} id - ID уведомления
   */
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  /**
   * Очищает все уведомления
   */
  const clearNotifications = () => {
    notifications.value = [];
  };

  /**
   * Показывает уведомление об успехе
   * @param {string} title - Заголовок
   * @param {string} [message] - Сообщение
   * @param {number} [duration] - Длительность
   */
  const notifySuccess = (title, message, duration) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  };

  /**
   * Показывает уведомление об ошибке
   * @param {string} title - Заголовок
   * @param {string} [message] - Сообщение
   * @param {number} [duration] - Длительность
   */
  const notifyError = (title, message, duration = 7000) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  };

  /**
   * Показывает предупреждение
   * @param {string} title - Заголовок
   * @param {string} [message] - Сообщение
   * @param {number} [duration] - Длительность
   */
  const notifyWarning = (title, message, duration) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  };

  /**
   * Показывает информационное уведомление
   * @param {string} title - Заголовок
   * @param {string} [message] - Сообщение
   * @param {number} [duration] - Длительность
   */
  const notifyInfo = (title, message, duration) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
}
