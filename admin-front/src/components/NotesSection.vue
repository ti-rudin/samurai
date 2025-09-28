<template>
  <div class="bg-white dark:bg-gray-800 p-3 my-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
    <h2 class="text-lg font-semibold mb-3">Примечания</h2>
    <div>
      <textarea 
        ref="textareaRef"
        v-model="notes" 
        rows="3"
        class="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm resize-none overflow-hidden"
        style="min-height: 80px;"
        placeholder="Введите примечания к заказу..."
        @input="onNotesChange"
        @keydown.enter="handleEnter"></textarea>
    </div>
    <div class="flex justify-center mt-2">
      <button :disabled="!notesChanged" @click="onSaveNotes" type="button"
        class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:hover:bg-green-500 text-sm">
        Сохранить
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  notes: {
    type: String,
    default: ''
  },
  notesChanged: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:notes',
  'save-notes'
]);

const notes = ref(props.notes);
const textareaRef = ref(null);

// Функция автоматического изменения размера textarea
const autoResize = () => {
  if (textareaRef.value) {
    // Сбрасываем высоту для правильного расчета
    textareaRef.value.style.height = 'auto';
    // Устанавливаем высоту равную scrollHeight
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

// Следим за изменениями props.notes
watch(() => props.notes, (newValue) => {
  notes.value = newValue;
  // Автоматически изменяем размер после обновления значения
  nextTick(() => {
    autoResize();
  });
});

// Следим за изменениями локального notes
watch(notes, () => {
  nextTick(() => {
    autoResize();
  });
});

const onNotesChange = () => {
  emit('update:notes', notes.value);
  autoResize();
};

const onSaveNotes = () => {
  emit('save-notes');
};

// Обработка Enter для сохранения переводов строк
const handleEnter = (event) => {
  // Разрешаем обычное поведение Enter (создание новой строки)
  // Не предотвращаем событие, чтобы переводы строк работали
};

// Инициализация размера при монтировании
onMounted(() => {
  nextTick(() => {
    autoResize();
  });
});
</script>
