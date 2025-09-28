<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="$emit('close')">
      <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
        <!-- Header - fixed at top -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg sm:text-xl font-semibold">{{ part.number ? 'Редактировать запчасть' : 'Добавить запчасть' }}</h3>
          <button @click="$emit('close')" class="text-gray-600 hover:text-gray-900 dark:hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <form @submit.prevent="$emit('save', form)" class="space-y-4">
            <div>
              <label class="block mb-1 font-semibold" for="name">Наименование *</label>
              <input v-model="form.name" id="name" type="text" required
                class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold" for="quantity">Кол-во *</label>
              <input v-model.number="form.quantity" id="quantity" type="number" min="1" required
                class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold" for="number">Номер *</label>
              <input v-model="form.number" id="number" type="text" required
                class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold" for="price">Цена (₽) *</label>
              <input v-model.number="form.price" id="price" type="number" min="0" step="0.01" required
                class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold" for="partstatus">Статус *</label>
              <select v-model="form.partstatus" id="partstatus" required
                class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-200">
                <option value="pending_from_client">Ожидаем от клиента</option>
                <option value="need_to_order">Надо заказать</option>
                <option value="ordered">Заказано</option>
                <option value="onbase">На базе</option>
              </select>
            </div>
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="form.isRecomended"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Рекомендуемая запчасть</span>
              </label>
            </div>
          </form>
        </div>

        <!-- Footer with buttons - fixed at bottom -->
        <div class="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 transition-colors">Отмена</button>
          <button type="submit" @click="$emit('save', form)" class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">Сохранить</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  part: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save', 'close']);

const form = ref({
  id: null,
  number: '',
  name: '',
  quantity: 1,
  price: 0,
  partstatus: 'pending_from_client',
  isRecomended: false,
});

watch(
  () => props.part,
  (newPart) => {
    if (newPart) {
      form.value = {
        id: newPart.id,
        number: newPart.number || '0000',
        name: newPart.name || '',
        quantity: newPart.quantity || 1,
        price: newPart.price || 0,
        partstatus: newPart.partstatus || 'pending_from_client',
        isRecomended: newPart.isRecomended || false,
      };
    } else {
      form.value = {
        id: null,
        number: '0000',
        name: '',
        quantity: 1,
        price: 0,
        partstatus: 'pending_from_client',
        isRecomended: false,
      };
    }
  },
  { immediate: true }
);

// Блокировка прокрутки body при открытии модалки
watch(() => props.show, (newShow) => {
  if (newShow) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Очистка при размонтировании компонента
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>
