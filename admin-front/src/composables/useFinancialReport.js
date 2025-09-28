import { ref, computed } from 'vue'
import api from '../api/strapi'
import { useExecutors } from './useExecutors'

export function useFinancialReport() {
  // Реактивные переменные
  const selectedPeriod = ref(null)
  const customStartDate = ref('')
  const customEndDate = ref('')
  const isLoading = ref(false)
  const error = ref(null)
  const reportData = ref({
    completedOrders: [],
    executorEarnings: []
  })

  // Дополнительные переменные для отладки
  const allCompletedOrdersCount = ref(0)
  const allCompletedWorksCount = ref(0)
  const lastCompletionDate = ref(null)
  const suggestedWeek = ref('')
  const selectedWeek = ref('')
  const expandedExecutors = ref(new Set())

  // Используем composable для работы с исполнителями
  const { executors: allExecutors, loadExecutors } = useExecutors()

  // Предустановленные периоды
  const predefinedPeriods = ref([
    {
      key: 'current-week',
      label: 'Текущая неделя',
      getDates: () => {
        const now = new Date()
        const { year, weekNumber } = getWeekForDate(now)
        const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`
        return getWeekDates(weekString)
      }
    },
    {
      key: 'last-week',
      label: 'Прошлая неделя',
      getDates: () => {
        const now = new Date()
        now.setDate(now.getDate() - 7)
        const { year, weekNumber } = getWeekForDate(now)
        const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`
        return getWeekDates(weekString)
      }
    },
    {
      key: 'current-month',
      label: 'Текущий месяц',
      getDates: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { monday: start, sunday: end }
      }
    }
  ])

  // Проверка возможности загрузки данных
  const canLoadData = computed(() => {
    if (selectedPeriod.value && selectedPeriod.value.key !== 'custom') {
      return true
    }
    return customStartDate.value && customEndDate.value && new Date(customStartDate.value) <= new Date(customEndDate.value)
  })

  // Вычисляемые свойства для статистики
  const totalCompletedOrders = computed(() => reportData.value.completedOrders.length)

  const totalCompletedWorks = computed(() => {
    return reportData.value.completedOrders.reduce((sum, order) => {
      return sum + (order.works?.filter(work => work.status_of_work === 'completed') || []).length
    }, 0)
  })

  const totalEarnings = computed(() => {
    return reportData.value.executorEarnings.reduce((sum, executor) => sum + executor.earnings, 0)
  })

  const executorEarnings = computed(() => reportData.value.executorEarnings)

  // Общая выручка (сумма работ + стоимость запчастей, кроме рекомендуемых)
  const totalRevenue = computed(() => {
    return reportData.value.completedOrders.reduce((total, order) => {
      let orderTotal = 0

      // Сумма работ
      if (order.works && order.works.length > 0) {
        order.works.forEach(work => {
          orderTotal += work.cost || 0
        })
      }

      // Сумма запчастей (кроме рекомендуемых)
      if (order.parts && order.parts.length > 0) {
        const nonRecommendedParts = order.parts.filter(p => p.isRecomended !== true)
        nonRecommendedParts.forEach(part => {
          const quantity = Number(part.quantity) || 1
          const price = Number(part.price) || 0
          orderTotal += quantity * price
        })
      }

      return total + orderTotal
    }, 0)
  })

  // Стоимость запчастей
  const totalPartsCost = computed(() => {
    return reportData.value.completedOrders.reduce((sum, order) => {
      const orderPartsCost = (order.parts || [])
        .filter(p => p.isRecomended !== true)
        .reduce((partsSum, part) => {
          const quantity = Number(part.quantity) || 1
          const price = Number(part.price) || 0
          return partsSum + quantity * price
        }, 0)
      return sum + orderPartsCost
    }, 0)
  })

  // Прибыль (выручка минус начисления исполнителям минус стоимость запчастей)
  const totalProfit = computed(() => {
    return totalRevenue.value - totalEarnings.value - totalPartsCost.value
  })

  // Выручка по клиентам
  const clientRevenues = computed(() => {
    const clientMap = new Map()

    reportData.value.completedOrders.forEach(order => {
      if (!order.client) return

      const clientId = order.client.id
      const clientName = order.client.name || 'Неизвестный клиент'
      const clientPhone = order.client.phone || null

      // Рассчитываем выручку по заказу (работы + запчасти, кроме рекомендуемых)
      let orderRevenue = order.works?.reduce((sum, work) => {
        return sum + (work.cost || 0)
      }, 0) || 0

      // Добавляем стоимость запчастей (кроме рекомендуемых)
      if (order.parts && order.parts.length > 0) {
        const nonRecommendedParts = order.parts.filter(p => p.isRecomended !== true)
        const partsCost = nonRecommendedParts.reduce((sum, part) => {
          const quantity = Number(part.quantity) || 1
          const price = Number(part.price) || 0
          return sum + quantity * price
        }, 0)
        orderRevenue += partsCost
      }

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          name: clientName,
          phone: clientPhone,
          orderCount: 0,
          revenue: 0
        })
      }

      const clientData = clientMap.get(clientId)
      clientData.orderCount += 1
      clientData.revenue += orderRevenue
    })

    // Преобразуем в массив и рассчитываем проценты
    const totalAllRevenue = totalRevenue.value
    return Array.from(clientMap.values())
      .map(client => ({
        ...client,
        percentage: totalAllRevenue > 0 ? ((client.revenue / totalAllRevenue) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue) // Сортировка по убыванию выручки
  })

  // Детальная разбивка начислений по исполнителям, заказам и работам
  const executorDetails = computed(() => {
    const details = []

    reportData.value.completedOrders.forEach(order => {
      const clientName = order.client?.name || 'Неизвестный клиент'

      order.works?.forEach(work => {
        const workCost = work.cost || 0
        const executorPercentage = work.executorPercentage || 0

        // Если есть executorPays, используем их для детальной разбивки
        if (work.executorPays && work.executorPays.length > 0) {
          work.executorPays.forEach(executorPay => {
            const executor = work.executor?.find(e => e.id === executorPay.id)
            const executorId = executorPay.id
            const executorName = getExecutorName(executor) || `Исполнитель #${executorId}`
            const executorShare = executorPay.percentage || 0
            const earnings = (workCost * executorPercentage / 100) * (executorShare / 100)

            details.push({
              executorId,
              executorName,
              orderId: order.id,
              clientName,
              workId: work.id,
              workName: work.name || `Работа #${work.id}`,
              workCost,
              executorPercentage: executorShare,
              earnings
            })
          })
        }
        // Иначе используем старый формат с executor
        else if (work.executor && work.executor.length > 0) {
          const workExecutor = work.executor[0]
          const executorId = workExecutor.id
          const executorName = getExecutorName(workExecutor) || `Исполнитель #${executorId}`
          const earnings = workCost * (executorPercentage / 100)

          details.push({
            executorId,
            executorName,
            orderId: order.id,
            clientName,
            workId: work.id,
            workName: work.name || `Работа #${work.id}`,
            workCost,
            executorPercentage: 100, // В старом формате 100%
            earnings
          })
        }
      })
    })

    // Сортировка: по заказу, затем по исполнителю
    return details.sort((a, b) => {
      if (a.orderId !== b.orderId) {
        return a.orderId - b.orderId
      }
      return a.executorName.localeCompare(b.executorName)
    })
  })

  // Методы для работы с периодами
  const setPeriod = (period) => {
    selectedPeriod.value = period
    customStartDate.value = ''
    customEndDate.value = ''
    loadReportData()
  }

  const onCustomDateChange = () => {
    if (customStartDate.value && customEndDate.value) {
      selectedPeriod.value = {
        key: 'custom',
        label: 'Произвольный период',
        getDates: () => ({
          monday: new Date(customStartDate.value),
          sunday: new Date(customEndDate.value)
        })
      }
    }
  }

  const formatPeriodRange = (period) => {
    if (!period) return '-'

    let dates
    if (period.key === 'custom') {
      dates = {
        monday: new Date(customStartDate.value),
        sunday: new Date(customEndDate.value)
      }
    } else {
      dates = period.getDates()
    }

    return `${dates.monday.toLocaleDateString('ru-RU')} - ${dates.sunday.toLocaleDateString('ru-RU')}`
  }

  // Основной метод загрузки данных
  const loadReportData = async () => {
    if (!selectedPeriod.value) return

    try {
      isLoading.value = true
      error.value = null

      const { monday, sunday } = selectedPeriod.value.getDates()

      // Сначала загружаем список исполнителей
      await loadExecutors()

      // Получаем все завершенные заказы (без фильтра по дате)
      const ordersResponse = await api.get('/orders', {
        params: {
          filters: {
            orderstatus: 'completed'
          },
          populate: {
            works: {
              populate: {
                executor: true
              }
            },
            client: true,
            parts: true
          },
          pagination: {
            pageSize: 1000 // Получаем все завершенные заказы
          }
        }
      })

      if (!ordersResponse.data?.data) {
        throw new Error('Некорректный ответ API')
      }

      const allCompletedOrders = ordersResponse.data.data
      const executorMap = new Map()
      const filteredOrders = []
      let latestCompletionDate = null

      // Собираем статистику по всем завершенным работам
      let totalCompletedWorksAll = 0
      allCompletedOrders.forEach(order => {
        if (order.works && order.works.length > 0) {
          const completedWorks = order.works.filter(w => w.status_of_work === 'completed')
          totalCompletedWorksAll += completedWorks.length

          // Ищем самую позднюю дату завершения
          completedWorks.forEach(work => {
            const completionDate = new Date(work.updatedAt || work.createdAt)
            if (!latestCompletionDate || completionDate > latestCompletionDate) {
              latestCompletionDate = completionDate
            }
          })
        }
      })

      // Обновляем переменные для отладки
      allCompletedOrdersCount.value = allCompletedOrders.length
      allCompletedWorksCount.value = totalCompletedWorksAll
      lastCompletionDate.value = latestCompletionDate

      // Фильтруем заказы, у которых есть завершенные работы в выбранную неделю
      let ordersInWeekCount = 0
      let totalWorksInWeek = 0

      allCompletedOrders.forEach(order => {
        if (order.works && order.works.length > 0) {
          const completedWorksInWeek = order.works.filter(work => {
            // Проверяем, что работа завершена
            if (work.status_of_work !== 'completed') return false

            // Используем updatedAt работы как дату завершения
            // Если updatedAt отсутствует, используем createdAt работы
            const completionDate = new Date(work.updatedAt || work.createdAt)
            // Приводим completionDate к UTC для сравнения
            const completionDateUTC = new Date(Date.UTC(
              completionDate.getUTCFullYear(),
              completionDate.getUTCMonth(),
              completionDate.getUTCDate()
            ))

            const isInWeek = completionDateUTC >= monday && completionDateUTC <= sunday
            return isInWeek
          })

          // Если в заказе есть завершенные работы за неделю, добавляем его
          if (completedWorksInWeek.length > 0) {
            ordersInWeekCount++
            totalWorksInWeek += completedWorksInWeek.length

            filteredOrders.push({
              ...order,
              works: completedWorksInWeek, // Оставляем только работы за неделю
              // Но сохраняем все запчасти заказа для правильного расчета стоимости
              parts: order.parts || []
            })

            // Обрабатываем завершенные работы для расчета начислений
            completedWorksInWeek.forEach(work => {
              const workCost = work.cost || 0
              const executorPercentage = work.executorPercentage || 0

              // Если есть executorPays, используем их для расчета
              if (work.executorPays && work.executorPays.length > 0) {
                work.executorPays.forEach(executorPay => {
                  const executorId = executorPay.id
                  const executor = allExecutors.value.find(e => e.id === executorId)
                  const executorName = executor ? (executor.username || executor.name || `Исполнитель #${executorId}`) : `Исполнитель #${executorId}`
                  const executorShare = executorPay.percentage || 0
                  const earnings = (workCost * executorPercentage / 100) * (executorShare / 100)

                  if (!executorMap.has(executorId)) {
                    executorMap.set(executorId, {
                      id: executorId,
                      name: executorName,
                      workCount: 0,
                      earnings: 0
                    })
                  }

                  const executorData = executorMap.get(executorId)
                  executorData.workCount += 1
                  executorData.earnings += earnings
                })
              }
              // Иначе используем старый формат с executor и executorPercentage
              else if (work.executor && work.executor.length > 0) {
                const workExecutor = work.executor[0] // Берем первого исполнителя
                const executorId = workExecutor.id
                const executor = allExecutors.value.find(e => e.id === executorId)
                const executorName = executor ? (executor.username || executor.name || `Исполнитель #${executorId}`) : `Исполнитель #${executorId}`
                const earnings = workCost * (executorPercentage / 100)

                if (!executorMap.has(executorId)) {
                  executorMap.set(executorId, {
                    id: executorId,
                    name: executorName,
                    workCount: 0,
                    earnings: 0
                  })
                }

                const executorData = executorMap.get(executorId)
                executorData.workCount += 1
                executorData.earnings += earnings
              }
            })
          }
        }
      })

      // Преобразуем Map в массив и рассчитываем проценты
      const totalAllEarnings = Array.from(executorMap.values()).reduce((sum, exec) => sum + exec.earnings, 0)

      const executorEarningsArray = Array.from(executorMap.values())
        .map(executor => ({
          ...executor,
          percentage: totalAllEarnings > 0 ? ((executor.earnings / totalAllEarnings) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.earnings - a.earnings) // Сортировка по убыванию суммы

      reportData.value = {
        completedOrders: filteredOrders,
        executorEarnings: executorEarningsArray
      }

    } catch (err) {
      error.value = err.message || 'Ошибка загрузки данных'
      reportData.value = {
        completedOrders: [],
        executorEarnings: []
      }
    } finally {
      isLoading.value = false
    }
  }

  // Вспомогательные функции
  const getCurrentWeek = () => {
    const now = new Date()
    const { year, weekNumber } = getWeekForDate(now)
    const result = `${year}-W${weekNumber.toString().padStart(2, '0')}`
    return result
  }

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const firstThursday = new Date(yearStart)
    const firstDayNum = firstThursday.getUTCDay() || 7
    firstThursday.setUTCDate(yearStart.getUTCDate() + 4 - firstDayNum)
    const weekNo = Math.ceil((((d - firstThursday) / 86400000) + 1) / 7)
    return weekNo
  }

  const getWeekForDate = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)

    let year = d.getUTCFullYear()
    if (weekNumber === 1 && d.getUTCMonth() === 11) {
      year += 1
    } else if ((weekNumber === 52 || weekNumber === 53) && d.getUTCMonth() === 0) {
      year -= 1
    }

    return { year, weekNumber }
  }

  const getWeekDates = (weekString) => {
    const [year, week] = weekString.split('-W').map(Number)
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
    const dayOfWeek = simple.getUTCDay() || 7
    const monday = new Date(simple)
    monday.setUTCDate(simple.getUTCDate() - dayOfWeek + 1)
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    return { monday, sunday }
  }

  const getExecutorName = (executor) => {
    return executor ? (executor.username || executor.name) : null
  }

  return {
    // Реактивные переменные
    selectedPeriod,
    customStartDate,
    customEndDate,
    isLoading,
    error,
    predefinedPeriods,
    canLoadData,
    allCompletedOrdersCount,
    allCompletedWorksCount,
    lastCompletionDate,
    suggestedWeek,
    selectedWeek,
    expandedExecutors,

    // Вычисляемые свойства
    totalCompletedOrders,
    totalCompletedWorks,
    totalEarnings,
    totalRevenue,
    totalPartsCost,
    totalProfit,
    executorEarnings,
    clientRevenues,
    executorDetails,

    // Методы
    setPeriod,
    onCustomDateChange,
    formatPeriodRange,
    loadReportData,
    getCurrentWeek
  }
}
