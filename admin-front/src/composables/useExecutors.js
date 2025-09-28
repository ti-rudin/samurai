import { ref } from 'vue'
import api from '../api/strapi'

/**
 * Композабл для работы с исполнителями
 */
export function useExecutors() {
  const executors = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Загрузка исполнителей
   * @param {Object} options - Опции загрузки
   * @param {string} options.role - Фильтр по роли (по умолчанию 'mechanic')
   * @returns {Promise<Array>} Массив исполнителей
   */
  const loadExecutors = async (options = {}) => {
    try {
      loading.value = true
      error.value = null

      const { role = 'mechanic' } = options

      const response = await api.get('/users', {
        params: {
          'filters[role][name][$eq]': role,
          'populate': 'role'
        }
      })

      let loadedExecutors = []
      if (response.data?.data) {
        // Strapi v4 format
        loadedExecutors = response.data.data.map(user => ({
          id: user.id,
          name: user.attributes?.username || `Пользователь #${user.id}`
        }))
      } else if (Array.isArray(response.data)) {
        // Direct array format
        loadedExecutors = response.data.map(user => ({
          id: user.id,
          name: user.username || user.attributes?.username || `Пользователь #${user.id}`
        }))
      } else {
        // Fallback данные
        loadedExecutors = [
          { id: 1, name: 'Иванов Иван' },
          { id: 2, name: 'Петров Петр' },
          { id: 3, name: 'Сидоров Сидор' }
        ]
      }

      executors.value = loadedExecutors
      return loadedExecutors
    } catch (err) {
      console.error('[LOAD_EXECUTORS] Ошибка загрузки исполнителей:', err)
      error.value = err.message || 'Ошибка загрузки исполнителей'

      // Возвращаем fallback данные в случае ошибки
      const fallbackExecutors = [
        { id: 1, name: 'Иванов Иван' },
        { id: 2, name: 'Петров Петр' },
        { id: 3, name: 'Сидоров Сидор' }
      ]
      executors.value = fallbackExecutors
      console.log('[LOAD_EXECUTORS] Возвращаем fallback данные:', fallbackExecutors)
      return fallbackExecutors
    } finally {
      loading.value = false
    }
  }

  /**
   * Получение исполнителя по ID
   * @param {number} executorId - ID исполнителя
   * @returns {Object|null} Исполнитель или null
   */
  const getExecutorById = (executorId) => {
    return executors.value.find(executor => executor.id === executorId) || null
  }

  /**
   * Обновление списка исполнителей (принудительная перезагрузка)
   * @param {Object} options - Опции загрузки
   * @returns {Promise<Array>} Массив исполнителей
   */
  const refreshExecutors = async (options = {}) => {
    return await loadExecutors(options)
  }

  return {
    executors,
    loading,
    error,
    loadExecutors,
    getExecutorById,
    refreshExecutors
  }
}
