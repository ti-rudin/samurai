<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ссылка на изображение заказа</h2>
      
      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Изображение заказа успешно загружено. Ссылка для просмотра:
        </p>
        
        <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded">
          <input
            ref="linkInput"
            :value="fullImageUrl"
            type="text"
            readonly
            class="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 truncate"
            @focus="selectLink"
          />
          <button
            @click="copyLink"
            class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Скопировать ссылку"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="openLink"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Открыть
        </button>
        <button
          @click="close"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useNotifications } from '../composables/useNotifications'

const { notifySuccess, notifyError } = useNotifications()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])
const linkInput = ref(null)

const fullImageUrl = computed(() => {
  if (!props.imageUrl) return '';

  // Ссылка уже полная на основной домен
  return props.imageUrl;
})

const close = () => {
  emit('close')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(fullImageUrl.value)
    notifySuccess('Ссылка скопирована в буфер обмена')
  } catch (err) {
    console.error('Не удалось скопировать ссылку:', err)
    notifyError('Не удалось скопировать ссылку')
    // Fallback для старых браузеров
    linkInput.value.select()
    document.execCommand('copy')
  }
}

const selectLink = () => {
  linkInput.value.select()
}

const openLink = () => {
  window.open(fullImageUrl.value, '_blank')
}
</script>

<style scoped>
.fixed {
  position: fixed;
  z-index: 9999;
}

input:focus {
  box-shadow: none;
  outline: none;
}
</style>
