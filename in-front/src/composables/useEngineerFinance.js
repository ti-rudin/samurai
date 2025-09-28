import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'

export function useEngineerFinance() {
  const authStore = useAuthStore()
  const ordersStore = useOrdersStore()

  // Получение задач текущего инженера
  const engineerTasks = computed(() => {
    const currentUserId = authStore.userId
    const allTasks = []

    ordersStore.orders.forEach(order => {
      if (order.works && order.works.length > 0) {
        order.works.forEach(work => {
          // Проверяем, является ли текущий пользователь инженером этой работы
          let isEngineer = false

          if (work.executor) {
            if (Array.isArray(work.executor)) {
              if (work.executor.length > 0) {
                isEngineer = work.executor.some(exec => exec.id === currentUserId)
              }
            } else if (work.executor.id) {
              isEngineer = work.executor.id === currentUserId
            } else if (work.executor === currentUserId) {
              isEngineer = true
            }
          }

          if (isEngineer) {
            // Рассчитываем финансовую информацию
            const workCost = work.cost || 0
            const executorPercentage = work.executorPercentage || 0
            const totalWorkEarnings = workCost * (executorPercentage / 100) // Общая сумма начислений для работы
            let earnings = 0

            // Если есть executorPays с индивидуальными процентами от общей суммы
            if (work.executorPays && Array.isArray(work.executorPays) && work.executorPays.length > 0) {
              const currentUserPay = work.executorPays.find(pay => pay.id === currentUserId)
              if (currentUserPay && currentUserPay.percentage) {
                earnings = totalWorkEarnings * (currentUserPay.percentage / 100)
              } else {
                // Если процент не найден, делим поровну между исполнителями
                const totalExecutors = work.executorPays.length
                earnings = totalWorkEarnings / totalExecutors
              }
            } else {
              // Старый способ с executorPercentage
              const totalExecutors = Array.isArray(work.executor) ? work.executor.length : 1
              earnings = totalWorkEarnings / totalExecutors
            }

            // Используем правильное поле для даты завершения
            const completedAt = work.completedAt || work.updatedAt

            allTasks.push({
              id: work.id,
              name: work.name,
              description: work.description,
              status: work.status_of_work,
              cost: workCost,
              executorPercentage: executorPercentage,
              earnings: earnings,
              createdAt: work.createdAt,
              completedAt: completedAt,
              orderId: order.id,
              clientName: order.client?.name || 'Неизвестный клиент',
              carName: `${order.car?.make || ''} ${order.car?.model || ''}`.trim() || 'Неизвестный автомобиль',
              order: order
            })
          }
        })
      }
    })

    return allTasks
  })

  // Завершенные задачи
  const completedTasks = computed(() => {
    return engineerTasks.value.filter(task => task.status === 'completed')
  })

  // Финансовые метрики
  const financialMetrics = computed(() => {
    const tasks = completedTasks.value

    const totalEarnings = tasks.reduce((sum, task) => sum + task.earnings, 0)
    const totalTasks = tasks.length
    const averageEarnings = totalTasks > 0 ? totalEarnings / totalTasks : 0
    const totalWorkCost = tasks.reduce((sum, task) => sum + task.cost, 0)

    return {
      totalEarnings,
      totalTasks,
      averageEarnings,
      totalWorkCost
    }
  })

  // Финансовые метрики по периодам
  const getFinancialMetricsByPeriod = (period) => {
    if (!period) return financialMetrics.value

    const { monday, sunday } = period.getDates()

    const tasksInPeriod = completedTasks.value.filter(task => {
      if (!task.completedAt) return false
      const completionDate = new Date(task.completedAt)
      const completionDateUTC = new Date(Date.UTC(
        completionDate.getUTCFullYear(),
        completionDate.getUTCMonth(),
        completionDate.getUTCDate()
      ))
      return completionDateUTC >= monday && completionDateUTC <= sunday
    })

    const totalEarnings = tasksInPeriod.reduce((sum, task) => sum + task.earnings, 0)
    const totalTasks = tasksInPeriod.length
    const averageEarnings = totalTasks > 0 ? totalEarnings / totalTasks : 0
    const totalWorkCost = tasksInPeriod.reduce((sum, task) => sum + task.cost, 0)

    return {
      totalEarnings,
      totalTasks,
      averageEarnings,
      totalWorkCost,
      tasks: tasksInPeriod
    }
  }

  // Сравнение с предыдущим периодом
  const getPeriodComparison = (currentPeriod, previousPeriod) => {
    const current = getFinancialMetricsByPeriod(currentPeriod)
    const previous = getFinancialMetricsByPeriod(previousPeriod)

    const earningsChange = previous.totalEarnings > 0
      ? ((current.totalEarnings - previous.totalEarnings) / previous.totalEarnings) * 100
      : 0

    const tasksChange = previous.totalTasks > 0
      ? ((current.totalTasks - previous.totalTasks) / previous.totalTasks) * 100
      : 0

    return {
      current,
      previous,
      earningsChange,
      tasksChange
    }
  }

  return {
    engineerTasks,
    completedTasks,
    financialMetrics,
    getFinancialMetricsByPeriod,
    getPeriodComparison
  }
}
