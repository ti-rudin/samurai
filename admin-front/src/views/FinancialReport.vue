<template>
  <div class="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-700 dark:text-gray-300">
    <section class="mb-8">
      <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-down">
        Отчет
      </h1>

      <!-- Фильтр по периодам -->
      <PeriodFilter
        :predefined-periods="predefinedPeriods"
        :selected-period="selectedPeriod"
        v-model:custom-start-date="customStartDate"
        v-model:custom-end-date="customEndDate"
        :can-load-data="canLoadData"
        @period-selected="setPeriod"
        @custom-date-change="onCustomDateChange"
        @load-data="loadReportData"
      />

      <!-- Индикатор загрузки -->
      <LoadingSpinner v-if="isLoading" text="Загрузка данных..." class="py-8" />

      <!-- Сообщение об ошибке -->
      <div v-else-if="error" class="text-center py-8 text-red-500">
        Ошибка загрузки: {{ error }}
      </div>

      <!-- Основной контент -->
      <template v-else>
        <!-- Финансовые показатели -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
          <FinancialInfo
            title="Выручка"
            :value="totalRevenue"
            icon="💰"
            color="emerald"
          />
          <FinancialInfo
            title="Расходы на исполнителей"
            :value="totalEarnings"
            icon="👥"
            color="purple"
          />
          <FinancialInfo
            title="Стоимость запчастей"
            :value="totalPartsCost"
            icon="🔧"
            color="orange"
          />
          <FinancialInfo
            title="Прибыль"
            :value="totalProfit"
            icon="📈"
            color="blue"
            :subtitle="`${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% маржинальность`"
          />
        </div>

        <!-- Выручка по клиентам -->
        <ClientRevenueTable :client-revenues="clientRevenues" />

        <!-- Суммарная таблица начислений -->
        <ExecutorEarningsTable
          :executor-earnings="executorEarnings"
          :executor-details="executorDetails"
          :selected-week="selectedWeek"
          :all-completed-orders-count="allCompletedOrdersCount"
          :all-completed-works-count="allCompletedWorksCount"
          :last-completion-date="lastCompletionDate"
          :suggested-week="suggestedWeek"
          @set-week="setWeek"
        />
      </template>
    </section>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useFinancialReport } from '../composables/useFinancialReport'

// Импортируем компоненты
import LoadingSpinner from '../components/LoadingSpinner.vue'
import FinancialInfo from '../components/FinancialInfo.vue'
import PeriodFilter from '../components/PeriodFilter.vue'
import ClientRevenueTable from '../components/ClientRevenueTable.vue'
import ExecutorEarningsTable from '../components/ExecutorEarningsTable.vue'

export default {
  name: 'FinancialReport',
  components: {
    LoadingSpinner,
    FinancialInfo,
    PeriodFilter,
    ClientRevenueTable,
    ExecutorEarningsTable
  },
  setup() {
    // Используем новый композабл
    const {
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

      // Вычисляемые свойства
      totalRevenue,
      totalEarnings,
      totalPartsCost,
      totalProfit,
      executorEarnings,
      clientRevenues,
      executorDetails,

      // Методы
      setPeriod,
      onCustomDateChange,
      loadReportData,
      getCurrentWeek
    } = useFinancialReport()

    // Установка конкретной недели
    const setWeek = (weekString) => {
      selectedWeek.value = weekString
      loadReportData()
    }

    // Инициализация - устанавливаем текущую неделю по умолчанию
    onMounted(() => {
      const currentWeekPeriod = predefinedPeriods.value.find(p => p.key === 'current-week')
      if (currentWeekPeriod) {
        setPeriod(currentWeekPeriod)
      }
    })

    return {
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
      totalRevenue,
      totalEarnings,
      totalPartsCost,
      totalProfit,
      executorEarnings,
      clientRevenues,
      executorDetails,
      setPeriod,
      onCustomDateChange,
      loadReportData,
      setWeek
    }
  }
}
</script>

<style>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
