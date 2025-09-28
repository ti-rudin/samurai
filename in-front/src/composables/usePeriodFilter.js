import { ref, computed } from 'vue'

export function usePeriodFilter() {
  // Реактивные переменные
  const selectedPeriod = ref(null)
  const customStartDate = ref('')
  const customEndDate = ref('')

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

  // Методы для работы с периодами
  const setPeriod = (period) => {
    selectedPeriod.value = period
    customStartDate.value = ''
    customEndDate.value = ''
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

  // Функция фильтрации задач по периоду
  const filterTasksByPeriod = (tasks) => {
    if (!selectedPeriod.value || !Array.isArray(tasks)) {
      return tasks
    }

    const { monday, sunday } = selectedPeriod.value.getDates()

    return tasks.filter(task => {
      if (!task.completedAt) return false

      const completionDate = new Date(task.completedAt)
      // Приводим к UTC для сравнения
      const completionDateUTC = new Date(Date.UTC(
        completionDate.getUTCFullYear(),
        completionDate.getUTCMonth(),
        completionDate.getUTCDate()
      ))

      return completionDateUTC >= monday && completionDateUTC <= sunday
    })
  }

  // Вспомогательные функции
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

  return {
    // Реактивные переменные
    selectedPeriod,
    customStartDate,
    customEndDate,
    predefinedPeriods,
    canLoadData,

    // Методы
    setPeriod,
    onCustomDateChange,
    filterTasksByPeriod
  }
}
