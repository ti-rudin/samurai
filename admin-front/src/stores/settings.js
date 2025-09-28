import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const hourlyRate = ref(1200)
  const executorPercentage = ref(50)

  // Загрузка из localStorage при инициализации
  const loadSettings = () => {
    const savedHourlyRate = localStorage.getItem('hourlyRate')
    const savedExecutorPercentage = localStorage.getItem('executorPercentage')

    if (savedHourlyRate) {
      hourlyRate.value = parseFloat(savedHourlyRate)
    }
    if (savedExecutorPercentage) {
      executorPercentage.value = parseFloat(savedExecutorPercentage)
    }
  }

  // Сохранение в localStorage при изменении
  watch(hourlyRate, (newValue) => {
    localStorage.setItem('hourlyRate', newValue.toString())
  })

  watch(executorPercentage, (newValue) => {
    localStorage.setItem('executorPercentage', newValue.toString())
  })

  // Инициализация при создании store
  loadSettings()

  return {
    hourlyRate,
    executorPercentage
  }
})
