<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
      <h2 class="text-lg font-semibold mb-2">Редактировать работу</h2>
      <input v-model="work.name" placeholder="Название работы" class="w-full p-2 border rounded mb-2" />
      <textarea v-model="work.description" placeholder="Описание работы" class="w-full p-2 border rounded mb-2"></textarea>
      <input v-model.number="work.cost" type="number" placeholder="Стоимость" class="w-full p-2 border rounded mb-2" />
      <div class="flex justify-end">
        <button @click="save" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Сохранить</button>
        <button @click="close" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  work: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:work', 'close']);

const save = () => {
  emit('update:work', work);
  close();
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.fixed {
  position: fixed;
}
</style>
