<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="handleBackdropClick">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
          <!-- Заголовок -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Генерация счета
            </h3>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" :disabled="isGenerating">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Содержимое -->
          <div class="p-6">
            <div v-if="isGenerating" class="text-center mb-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ status || 'Подготовка PDF документа...' }}</p>
            </div>

            <div v-else-if="pdfData" class="space-y-4">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  PDF счет успешно создан
                </p>
              </div>

              <div class="space-y-3">
                <div class="grid gap-3" :class="sharedUrl ? 'grid-cols-2' : 'grid-cols-2'">
                  <button @click="sharePDF"
                    class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    :disabled="isSharing">
                    <div v-if="isSharing" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                    Поделиться
                  </button>
                  <button @click="downloadPDF"
                    class="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Скачать
                  </button>
                </div>
                <button
                  v-if="sharedUrl"
                  @click="openSharedUrl"
                  class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Открыть
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useNotifications } from '../composables/useNotifications'
import { uploadImage } from '../api/strapi'
import config from '../config.js'

const { notifySuccess, notifyError } = useNotifications()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  pdfData: {
    type: Object,
    default: () => ({})
  },
  isGenerating: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])
const isSharing = ref(false)
const sharedUrl = ref('')

const close = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (!props.isGenerating) {
    emit('close')
  }
}

const sharePDF = async () => {
  if (!props.pdfData || !props.pdfData.blob) {
    notifyError('Данные PDF не найдены')
    return
  }

  isSharing.value = true

  try {
    const filename = `schet_na_oplatu_${props.pdfData.orderId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}`

    // Создаем файл из blob данных и загружаем в Strapi
    const file = new File([props.pdfData.blob], `${filename}.pdf`, { type: 'application/pdf' })
    const strapiUrl = await uploadImage(file)

    // Извлекаем полный путь с хэшем из Strapi URL
    const urlParts = strapiUrl.split('/');
    const fullFilename = urlParts[urlParts.length - 1]; // Получаем имя файла с хэшем

    // Создаем публичную ссылку
    const mainDomainUrl = `${config.MAIN_URL}/pdf/${fullFilename}`

    // Сохраняем ссылку для кнопки "Открыть"
    sharedUrl.value = mainDomainUrl

    // Копируем ссылку в буфер обмена
    await navigator.clipboard.writeText(mainDomainUrl)
    notifySuccess('Ссылка на PDF скопирована в буфер обмена')

  } catch (error) {
    console.error('Ошибка при публикации PDF:', error)
    notifyError('Не удалось опубликовать PDF')
  } finally {
    isSharing.value = false
  }
}



const openSharedUrl = () => {
  if (sharedUrl.value) {
    window.open(sharedUrl.value, '_blank')
  }
}

const downloadPDF = () => {
  if (!props.pdfData || !props.pdfData.blob) {
    notifyError('Данные PDF не найдены')
    return
  }

  // Создаем ссылку для скачивания
  const url = URL.createObjectURL(props.pdfData.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = props.pdfData.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  notifySuccess('PDF файл скачан')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
