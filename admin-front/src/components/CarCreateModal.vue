<template>
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
        <!-- Header - fixed at top -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {{ editingCar ? 'Редактировать автомобиль' : 'Создать новый автомобиль' }}
          </h3>
          <button @click="closeModal" class="text-gray-600 hover:text-gray-900 dark:hover:text-white p-1">
            <svg class="w-5 w-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Владелец -->
            <div>
              <label for="clientId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Владелец *
              </label>
              <select
                id="clientId"
                v-model="formData.clientId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="" disabled>Выберите владельца</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Распознать ПТС -->
            <div class="flex flex-col items-center space-y-2">
              <button
                type="button"
                @click="recognizePTS"
                :disabled="isRecognizing"
                class="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg v-if="isRecognizing" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isRecognizing ? 'Распознавание...' : 'Распознать ПТС' }}</span>
              </button>
              <div v-if="recognitionResult" class="text-sm text-gray-600 dark:text-gray-400">
                {{ recognitionResult }}
              </div>
            </div>

            <!-- Марка -->
            <div>
              <label for="make" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Марка *
              </label>
              <input
                id="make"
                v-model="formData.make"
                type="text"
                required
                placeholder="Например: Toyota"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <!-- Модель -->
            <div>
              <label for="model" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Модель *
              </label>
              <input
                id="model"
                v-model="formData.model"
                type="text"
                required
                placeholder="Например: Camry"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <!-- Год -->
            <div>
              <label for="year" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Год *
              </label>
              <input
                id="year"
                v-model.number="formData.year"
                type="number"
                required
                min="1900"
                :max="new Date().getFullYear() + 1"
                placeholder="2020"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <!-- Номер -->
            <div>
              <label for="licensePlate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ГосНомер *
              </label>
              <input
                id="licensePlate"
                v-model="formData.licensePlate"
                type="text"
                required
                placeholder="А000АА777"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <!-- VIN -->
            <div>
              <label for="vin" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                VIN
              </label>
              <input
                id="vin"
                v-model="formData.vin"
                type="text"
                placeholder="17-значный VIN номер"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
        </div>

        <!-- Footer with buttons - fixed at bottom -->
        <div class="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Отмена
          </button>
          <button
            type="submit"
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Сохранение...' : (editingCar ? 'Сохранить' : 'Создать автомобиль') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, reactive, watch, onUnmounted } from 'vue'

export default {
  name: 'CarCreateModal',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    editingCar: {
      type: Object,
      default: null
    },
    clients: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const isSubmitting = ref(false)
    const isRecognizing = ref(false)
    const recognitionResult = ref('')
    const formData = reactive({
      clientId: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: ''
    })

    // Сбрасываем форму при открытии модального окна
    watch(() => props.showModal, (newValue) => {
      if (newValue) {
        resetForm()
        if (props.editingCar) {
          populateForm()
        }
        // Блокируем прокрутку body при открытии модалки
        document.body.style.overflow = 'hidden'
      } else {
        // Восстанавливаем прокрутку body при закрытии модалки
        document.body.style.overflow = ''
      }
    })

    // Заполняем форму данными для редактирования
    watch(() => props.editingCar, (newCar) => {
      if (newCar && props.showModal) {
        populateForm()
      }
    })

    const resetForm = () => {
      formData.clientId = ''
      formData.make = ''
      formData.model = ''
      formData.year = ''
      formData.licensePlate = ''
      formData.vin = ''
    }

    const populateForm = () => {
      if (props.editingCar) {
        formData.clientId = props.editingCar.clientId || ''
        formData.make = props.editingCar.make || ''
        formData.model = props.editingCar.model || ''
        formData.year = props.editingCar.year || ''
        formData.licensePlate = props.editingCar.licensePlate || ''
        formData.vin = props.editingCar.vin || ''
      }
    }

    const handleSubmit = async () => {
      if (!formData.clientId || !formData.make?.trim() || !formData.model?.trim() || !formData.year || !formData.licensePlate?.trim()) {
        return
      }

      isSubmitting.value = true

      try {
        const carData = {
          clientId: formData.clientId,
          make: formData.make.trim(),
          model: formData.model.trim(),
          year: formData.year,
          licensePlate: formData.licensePlate.trim(),
          vin: formData.vin.trim() || ''
        }

        if (props.editingCar) {
          carData.id = props.editingCar.id
        }

        emit('submit', carData)
        closeModal()
      } catch (error) {
        console.error('Error submitting car:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const recognizePTS = async () => {
      isRecognizing.value = true
      recognitionResult.value = ''

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        const video = document.createElement('video')
        video.srcObject = stream
        video.play()

        // Создаем модальное окно для камеры
        const cameraModal = document.createElement('div')
        cameraModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50'
        cameraModal.innerHTML = `
          <div class="bg-white p-4 rounded">
            <video id="camera-video" autoplay class="w-full max-w-md"></video>
            <div class="mt-4 flex justify-end space-x-2">
              <button id="capture-btn" class="px-4 py-2 bg-blue-600 text-white rounded">Снять</button>
              <button id="cancel-btn" class="px-4 py-2 bg-gray-600 text-white rounded">Отмена</button>
            </div>
          </div>
        `
        document.body.appendChild(cameraModal)

        const cameraVideo = cameraModal.querySelector('#camera-video')
        cameraVideo.srcObject = stream

        cameraModal.querySelector('#cancel-btn').onclick = () => {
          stream.getTracks().forEach(track => track.stop())
          document.body.removeChild(cameraModal)
          isRecognizing.value = false
        }

        cameraModal.querySelector('#capture-btn').onclick = async () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = cameraVideo.videoWidth
            canvas.height = cameraVideo.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(cameraVideo, 0, 0)

            stream.getTracks().forEach(track => track.stop())
            document.body.removeChild(cameraModal)

            // Конвертируем в base64
            const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

            console.log('Base64 image length:', base64Image.length)
            console.log('Base64 image starts with:', base64Image.substring(0, 50))

            const requestBody = {
              img: base64Image
            }
            console.log('Request body:', requestBody)

            // Отправляем на API
            const response = await fetch('https://api.autoclub-samurai.ru/ai-pts-recognize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error('HTTP Error:', response.status, errorText)
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const data = await response.json()
            console.log('API Response:', data)
            console.log('Response type:', typeof data)
            console.log('Is array:', Array.isArray(data))

            // Проверяем формат ответа
            if (Array.isArray(data)) {
              parseEntitiesData(data)
            } else if (data.entities && Array.isArray(data.entities)) {
              parseEntitiesData(data.entities)
            } else {
              console.error('Unexpected response format:', data)
              recognitionResult.value = 'Неожиданный формат ответа от сервера'
              isRecognizing.value = false
            }
          } catch (error) {
            console.error('Error during recognition:', error)
            recognitionResult.value = 'Ошибка при распознавании'
            isRecognizing.value = false
          }
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        recognitionResult.value = 'Не удалось получить доступ к камере'
        isRecognizing.value = false
      }
    }

const parseEntitiesData = (entities) => {
  if (!Array.isArray(entities)) {
    recognitionResult.value = 'Неверный формат ответа от сервера'
    isRecognizing.value = false
    return
  }

  let foundCount = 0

  // Обрабатываем каждый entity
  entities.forEach(entity => {
    const { name, text } = entity

    // Пропускаем пустые значения
    if (!text || text.trim() === '' || text.toLowerCase() === 'отсутствует') return

    switch (name) {
      case 'stsfront_vin_number':
      case 'stsfront_car_trailer_number':
        if (text && text.length === 17 && !formData.vin) {
          formData.vin = text.toUpperCase()
          foundCount++
        }
        break

      case 'stsfront_car_number':
        if (text && !formData.licensePlate) {
          formData.licensePlate = text.toUpperCase()
          foundCount++
        }
        break

      case 'stsfront_car_brand':
        if (text && !formData.make) {
          formData.make = text.toUpperCase()
          foundCount++
        }
        break

      case 'stsfront_car_model':
        if (text && !formData.model) {
          formData.model = text.toUpperCase()
          foundCount++
        }
        break

      case 'stsfront_car_year':
        if (text && !formData.year) {
          const year = parseInt(text)
          if (year >= 1900 && year <= new Date().getFullYear() + 1) {
            formData.year = year
            foundCount++
          }
        }
        break
    }
  })

  recognitionResult.value = `Найдено полей: ${foundCount}/5`
  isRecognizing.value = false
}

    const closeModal = () => {
      emit('close')
      resetForm()
    }

    // Очистка при размонтировании компонента
    onUnmounted(() => {
      document.body.style.overflow = ''
    })

    return {
      isSubmitting,
      isRecognizing,
      recognitionResult,
      formData,
      handleSubmit,
      closeModal,
      recognizePTS
    }
  }
}
</script>
