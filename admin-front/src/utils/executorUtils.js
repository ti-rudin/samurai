/**
 * Утилиты для работы с исполнителями
 */

/**
 * Получает имя исполнителя из различных форматов данных
 * @param {Object|Array|Number|String} executor - Данные исполнителя
 * @param {Array} executorsList - Список всех исполнителей для поиска по ID
 * @returns {String} Имя исполнителя или 'Не назначен'
 */
export function getExecutorName(executor, executorsList = []) {
  if (!executor) return 'Не назначен'

  // Если executor - это массив (manyToMany relation)
  if (Array.isArray(executor)) {
    if (executor.length === 0) return 'Не назначен'
    if (executor.length === 1) {
      // Один исполнитель - обработаем его
      return getSingleExecutorName(executor[0], executorsList)
    } else {
      // Несколько исполнителей - возвращаем список имен через запятую
      const executorNames = executor
        .map(exec => getSingleExecutorName(exec, executorsList))
        .filter(name => name !== 'Не назначен');
      return executorNames.length > 0 ? executorNames.join(', ') : 'Не назначен';
    }
  }

  // Если executor - одиночный объект или ID
  return getSingleExecutorName(executor, executorsList)
}

/**
 * Получает имя одного исполнителя
 * @param {Object|Number|String} executor - Данные одного исполнителя
 * @param {Array} executorsList - Список всех исполнителей для поиска по ID
 * @returns {String} Имя исполнителя или 'Не назначен'
 */
export function getSingleExecutorName(executor, executorsList = []) {
  if (!executor) return 'Не назначен'

  // Проверяем на поврежденные данные
  if (typeof executor === 'object' && executor.username === 'Исполнитель #undefined') {
    return 'Не назначен'
  }

  // Если executor - это объект с данными
  if (typeof executor === 'object') {
    // Проверяем, содержит ли username уже готовую строку
    if (executor.username && !executor.username.includes('#undefined')) {
      return executor.username
    }

    if (executor.name) {
      return executor.name
    }

    // Strapi v4 format
    if (executor.data?.attributes?.username) {
      return executor.data.attributes.username
    }

    if (executor.data?.attributes?.name) {
      return executor.data.attributes.name
    }

    // Вложенные атрибуты
    if (executor.attributes?.username) {
      return executor.attributes.username
    }

    if (executor.attributes?.name) {
      return executor.attributes.name
    }

    // ID для поиска в списке исполнителей
    if (executor.id !== undefined && executor.id !== null && typeof executor.id === 'number') {
      const foundExecutor = executorsList.find(e => e.id === executor.id)
      if (foundExecutor) {
        return foundExecutor.username
      } else {
        return `Исполнитель #${executor.id}`
      }
    }
  }

  // Если executor - это просто ID
  if (typeof executor === 'number' || (typeof executor === 'string' && !isNaN(executor))) {
    const executorId = Number(executor)
    if (executorId && typeof executorId === 'number') {
      const foundExecutor = executorsList.find(e => e.id === executorId)
      return foundExecutor ? foundExecutor.username : `Исполнитель #${executorId}`
    }
  }

  return 'Не назначен'
}

/**
 * Преобразует данные исполнителя в формат для чекбоксов
 * @param {Object|Array} executor - Данные исполнителя
 * @returns {Array} Массив ID исполнителей
 */
export function normalizeExecutorForCheckboxes(executor) {
  if (!executor) return []

  let executorIds = []

  // Преобразуем executor в массив ID для чекбоксов
  if (Array.isArray(executor)) {
    executorIds = executor
      .map(executor => {
        // Если executor - объект с ID
        if (typeof executor === 'object' && executor && executor.id) {
          return executor.id
        }
        // Если executor - уже ID (число)
        if (typeof executor === 'number') {
          return executor
        }
        // Если executor - строка с ID
        if (typeof executor === 'string') {
          const numId = parseInt(executor, 10)
          return isNaN(numId) ? null : numId
        }
        return null
      })
      .filter(id => id !== null && id > 0)
  } else if (executor) {
    // Одиночный executor
    if (typeof executor === 'object' && executor && executor.id) {
      executorIds = [executor.id]
    } else if (typeof executor === 'number') {
      executorIds = [executor]
    } else if (typeof executor === 'string') {
      const numId = parseInt(executor, 10)
      if (!isNaN(numId) && numId > 0) {
        executorIds = [numId]
      }
    }
  }

  return executorIds
}

/**
 * Преобразует executorPays в массив с именами исполнителей
 * @param {Array} executorPays - Массив объектов {id, percentage}
 * @param {Array} executorsList - Список всех исполнителей
 * @returns {Array} Массив объектов {id, name, percentage}
 */
export function transformExecutorPaysWithNames(executorPays, executorsList = []) {
  if (!Array.isArray(executorPays)) return []

  return executorPays.map(pay => {
    const executor = executorsList.find(e => e.id === pay.id)
    return {
      id: pay.id,
      name: executor ? executor.name || executor.username : `Исполнитель #${pay.id}`,
      percentage: pay.percentage || 0
    }
  })
}

/**
 * Вычисляет равные доли для исполнителей
 * @param {number} count - Количество исполнителей
 * @returns {number} Доля на одного исполнителя
 */
export function calculateEqualShares(count) {
  if (count <= 0) return 0
  return Math.round((100 / count) * 100) / 100 // Округление до 2 знаков
}

/**
 * Перераспределяет доли равномерно между исполнителями
 * @param {Array} executorPays - Текущий массив executorPays
 * @returns {Array} Новый массив с равными долями
 */
export function redistributeEqualShares(executorPays) {
  if (!Array.isArray(executorPays) || executorPays.length === 0) return []

  const equalShare = calculateEqualShares(executorPays.length)

  return executorPays.map(pay => ({
    ...pay,
    percentage: equalShare
  }))
}

/**
 * Добавляет нового исполнителя с равной долей
 * @param {Array} currentExecutorPays - Текущий массив executorPays
 * @param {number} newExecutorId - ID нового исполнителя
 * @param {Array} executorsList - Список всех исполнителей
 * @returns {Array} Новый массив executorPays
 */
export function addExecutorWithEqualShare(currentExecutorPays, newExecutorId, executorsList = []) {
  const newCount = currentExecutorPays.length + 1
  const equalShare = calculateEqualShares(newCount)

  // Пересчитываем доли для существующих
  const updatedExisting = currentExecutorPays.map(pay => ({
    ...pay,
    percentage: equalShare
  }))

  // Добавляем нового
  const newPay = {
    id: newExecutorId,
    percentage: equalShare
  }

  return [...updatedExisting, newPay]
}

/**
 * Удаляет исполнителя и перераспределяет доли
 * @param {Array} currentExecutorPays - Текущий массив executorPays
 * @param {number} executorIdToRemove - ID исполнителя для удаления
 * @returns {Array} Новый массив executorPays
 */
export function removeExecutorAndRedistribute(currentExecutorPays, executorIdToRemove) {
  const filtered = currentExecutorPays.filter(pay => pay.id !== executorIdToRemove)

  if (filtered.length === 0) return []

  return redistributeEqualShares(filtered)
}

/**
 * Проверяет сумму долей в executorPays
 * @param {Array} executorPays - Массив executorPays
 * @param {number} tolerance - Допустимое отклонение (по умолчанию 0.01)
 * @returns {boolean} true если сумма = 100%
 */
export function validateExecutorPaysSum(executorPays, tolerance = 0.01) {
  if (!Array.isArray(executorPays) || executorPays.length === 0) return true

  const total = executorPays.reduce((sum, pay) => sum + (pay.percentage || 0), 0)
  return Math.abs(total - 100) <= tolerance
}

/**
 * Получает сумму долей в executorPays
 * @param {Array} executorPays - Массив executorPays
 * @returns {number} Сумма долей
 */
export function getExecutorPaysTotal(executorPays) {
  if (!Array.isArray(executorPays) || executorPays.length === 0) return 0

  return executorPays.reduce((sum, pay) => sum + (pay.percentage || 0), 0)
}

/**
 * Получает имя исполнителя из executorPays (новый формат)
 * @param {Array} executorPays - Массив объектов {id, percentage}
 * @param {Array} executorsList - Список всех исполнителей
 * @returns {String} Имена исполнителей или 'Не назначен'
 */
export function getExecutorNameFromPays(executorPays, executorsList = []) {
  if (!Array.isArray(executorPays) || executorPays.length === 0) {
    return 'Не назначен'
  }

  if (executorPays.length === 1) {
    // Один исполнитель
    const pay = executorPays[0]
    const executor = executorsList.find(e => e.id === pay.id)
    const name = executor ? executor.name || executor.username : `Исполнитель #${pay.id}`
    return `${name} (${pay.percentage}%)`
  } else {
    // Несколько исполнителей
    const names = executorPays.map(pay => {
      const executor = executorsList.find(e => e.id === pay.id)
      return executor ? executor.name || executor.username : `Исполнитель #${pay.id}`
    })
    return names.join(', ')
  }
}

/**
 * Получает полную информацию об исполнителях из executorPays
 * @param {Object} work - Объект работы
 * @param {Array} executorsList - Список всех исполнителей
 * @returns {String} Полная информация об исполнителях
 */
export function getWorkExecutorDisplayInfo(work, executorsList = []) {
  // Сначала пробуем новый формат executorPays
  if (work.executorPays && Array.isArray(work.executorPays) && work.executorPays.length > 0) {
    return getExecutorNameFromPays(work.executorPays, executorsList)
  }

  // Fallback на старый формат executor
  if (work.executor) {
    return getExecutorName(work.executor, executorsList)
  }

  return 'Не назначен'
}
