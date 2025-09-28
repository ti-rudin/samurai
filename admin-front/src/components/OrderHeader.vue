<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">#{{ props.order.id }} от {{ formatDate(props.order.createdAt, true) }}</h1>

    <div>
      <!-- Кнопки "Поделиться" и "Печать PDF" перемещены в секцию "Действия" -->
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '../utils/dateUtils';

const props = defineProps({
  order: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
</script>
