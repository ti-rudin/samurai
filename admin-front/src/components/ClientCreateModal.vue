<template>
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-hidden" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-900 rounded shadow relative flex flex-col max-h-full w-full max-w-md sm:max-w-md">
        <!-- Header - fixed at top -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {{ editingClient ? 'Редактировать клиента' : 'Создать нового клиента' }}
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
            <!-- Имя -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Имя клиента *
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                placeholder="Введите имя клиента"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <!-- Телефон -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон *
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
                placeholder="+7 (999) 999-99-99"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <!-- Адрес -->
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Адрес
              </label>
              <textarea
                id="address"
                v-model="formData.address"
                rows="3"
                placeholder="Введите адрес клиента (необязательно)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <!-- Секция управления логином и паролем -->
            <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">
                Управление учетной записью
              </h4>

              <!-- Логин -->
              <div class="mb-4">
                <label for="login" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Логин
                </label>
                <div class="flex">
                  <input
                    id="login"
                    v-model="formData.login"
                    type="text"
                    readonly
                    placeholder="Будет сгенерирован автоматически"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    @click="copyLogin"
                    :disabled="!formData.login"
                    class="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Скопировать логин"
                  >
                    <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Текущий пароль (только при редактировании) -->
              <div v-if="editingClient" class="mb-4">
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Текущий пароль
                </label>
                <div class="relative">
                  <input
                    id="currentPassword"
                    v-model="formData.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    readonly
                    placeholder="Пароль недоступен по соображениям безопасности"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    title="Показать/скрыть пароль"
                  >
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="!showCurrentPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path v-if="!showCurrentPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path v-if="showCurrentPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Пароль хранится в зашифрованном виде и не может быть отображен
                </p>
              </div>

              <!-- Новый пароль -->
              <div class="mb-4">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ editingClient ? 'Новый пароль' : 'Пароль' }}
                </label>
                <div class="flex">
                  <input
                    id="password"
                    v-model="formData.password"
                    type="text"
                    readonly
                    :placeholder="editingClient ? 'Оставьте пустым, чтобы не менять' : 'Будет сгенерирован автоматически'"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    @click="copyPassword"
                    :disabled="!formData.password"
                    class="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Скопировать пароль"
                  >
                    <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Кнопки управления -->
              <div class="flex space-x-2 mb-4">
                <button
                  type="button"
                  @click="generateLoginPassword"
                  :disabled="isGenerating || !formData.name.trim()"
                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isGenerating ? 'Генерация...' : 'Сгенерировать логин-пароль' }}
                </button>
                <button
                  type="button"
                  @click="copyConnectionString"
                  :disabled="!formData.login || !formData.password"
                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Скопировать строку подключения
                </button>
              </div>
            </div>

            <!-- Статус Проверен -->
            <div>
              <label class="flex items-center">
                <input
                  v-model="formData.verified"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600"
                />
                <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Проверен</span>
              </label>
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
            {{ isSubmitting ? 'Сохранение...' : (editingClient ? 'Сохранить' : 'Создать клиента') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, reactive, watch, onUnmounted } from 'vue'
import api from '../api/strapi'
import { useNotifications } from '../composables/useNotifications'
import { useAuthStore } from '../stores/auth'
import config from '../config.js'

export default {
  name: 'ClientCreateModal',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    editingClient: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { notifySuccess, notifyError } = useNotifications()
    const isSubmitting = ref(false)
    const isGenerating = ref(false)
    const showCurrentPassword = ref(false)
    const formData = reactive({
      name: '',
      phone: '',
      address: '',
      verified: false,
      login: '',
      password: '',
      currentPassword: '',
      userId: null
    })

    // Сбрасываем форму при открытии модального окна
    watch(() => props.showModal, (newValue) => {
      if (newValue) {
        resetForm()
        if (props.editingClient) {
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
    watch(() => props.editingClient, (newClient) => {
      if (newClient && props.showModal) {
        populateForm()
      }
    })

    const resetForm = () => {
      formData.name = ''
      formData.phone = ''
      formData.address = ''
      formData.verified = false
      formData.login = ''
      formData.password = ''
      formData.userId = null
    }

    const populateForm = () => {
      if (props.editingClient) {
        formData.name = props.editingClient.name || ''
        formData.phone = props.editingClient.phone || ''
        formData.address = props.editingClient.address || ''
        formData.verified = props.editingClient.verified || false

        // Извлекаем данные пользователя
        const user = props.editingClient.user
        if (user) {
          // Strapi может возвращать user как вложенный объект
          const userData = user.data || user
          const userAttributes = userData.attributes || userData
          formData.login = userAttributes.username || userData.username || ''
          formData.userId = userData.id
        } else {
          formData.login = ''
          formData.userId = null
        }

        formData.password = '' // Пароль не загружаем из безопасности
        formData.currentPassword = '••••••••' // Показываем, что пароль существует, но скрыт
      }
    }

    const handleSubmit = async () => {
      if (!formData.name.trim() || !formData.phone.trim()) {
        return
      }

      isSubmitting.value = true

      try {
        const clientData = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim() || '',
          verified: formData.verified
        }

        if (props.editingClient) {
          clientData.id = props.editingClient.id
        }

        // Если есть userId (новый пользователь создан), передаем его
        if (formData.userId) {
          clientData.userId = formData.userId
        }

        emit('submit', clientData)
        closeModal()
      } catch (error) {
        console.error('Error submitting client:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const closeModal = () => {
      emit('close')
      resetForm()
    }

    // Генерация логина на основе имени
    const generateLogin = async (name) => {
      // Транслитерация русских букв в английские
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      }

      // Сначала полностью транслитерируем имя
      let transliteratedName = ''
      for (let char of name.toLowerCase()) {
        if (translitMap[char]) {
          transliteratedName += translitMap[char]
        } else if (char.match(/[a-z]/)) {
          // Если символ уже латинский, оставляем как есть
          transliteratedName += char
        }
        // Игнорируем другие символы (пробелы, цифры и т.д.)
      }

      // Согласные буквы английского алфавита
      const consonants = 'bcdfghjklmnpqrstvwxyz'
      let firstThreeConsonants = ''

      // Проходим по транслитерированному имени и ищем первые три согласные
      for (let char of transliteratedName) {
        if (consonants.includes(char) && firstThreeConsonants.length < 3) {
          firstThreeConsonants += char
        }
      }

      // Если согласных меньше 3, дополняем
      while (firstThreeConsonants.length < 3) {
        firstThreeConsonants += 'a'
      }

      const now = new Date()
      const dd = String(now.getDate()).padStart(2, '0')
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const yyyy = now.getFullYear()

      let baseLogin = `${firstThreeConsonants}${dd}${mm}${yyyy}`
      let login = baseLogin
      let counter = 1

      // Проверяем уникальность логина
      while (true) {
        try {
          // Проверяем, существует ли пользователь с таким логином
          const checkResponse = await api.get(`/users?filters[username][$eq]=${login}`)
          if (!checkResponse.data || checkResponse.data.length === 0) {
            break // Логин свободен
          }
          login = `${baseLogin}${counter}`
          counter++
        } catch (error) {
          // Если ошибка при проверке, считаем логин свободным
          break
        }
      }

      return login
    }

    // Генерация пароля
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    // Генерация логина и пароля
    const generateLoginPassword = async () => {
      if (!formData.name.trim()) return

      isGenerating.value = true

      try {
        let login = formData.login
        let password = generatePassword()

        // Если редактируем клиента и у него уже есть логин, генерируем только пароль
        if (props.editingClient && formData.login && formData.userId) {
          // Обновляем только пароль существующего пользователя
          await api.put(`/users/${formData.userId}`, {
            password: password
          })
        } else {
          // Генерируем новый логин и создаем пользователя
          login = await generateLogin(formData.name)

          // Проверяем, является ли текущий пользователь администратором
          const authStore = useAuthStore()
          const isAdminUser = authStore.isAdmin

          let userResponse

         
            // Создаем пользователя через админ API
            userResponse = await api.post('/users', {
              username: login,
              email: `${login}@samurai.local`, // Используем локальный домен
              password: password,
              confirmed: true, // Автоматически подтверждаем пользователя
              blocked: false,
              role:5
            })

          // Связываем пользователя с клиентом
          if (userResponse.data?.id || userResponse.data?.user?.id) {
            formData.userId = userResponse.data.id || userResponse.data.user.id
          }
        }

        formData.login = login
        formData.password = password
      } catch (error) {
        console.error('Ошибка генерации логина/пароля:', error)
        notifyError('Ошибка при генерации учетных данных')
      } finally {
        isGenerating.value = false
      }
    }

    // Копирование строки подключения
    const copyConnectionString = async () => {
      if (!formData.login || !formData.password) return

      const connectionString = `${config.MAIN_URL}\n\n${formData.login}\n\m${formData.password}`

      try {
        await navigator.clipboard.writeText(connectionString)
        notifySuccess('Строка подключения скопирована в буфер обмена')
      } catch (error) {
        console.error('Ошибка копирования:', error)
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea')
        textArea.value = connectionString
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        notifySuccess('Строка подключения скопирована в буфер обмена')
      }
    }

    // Копирование логина
    const copyLogin = async () => {
      if (!formData.login) return

      try {
        await navigator.clipboard.writeText(formData.login)
        notifySuccess('Логин скопирован в буфер обмена')
      } catch (error) {
        console.error('Ошибка копирования логина:', error)
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea')
        textArea.value = formData.login
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        notifySuccess('Логин скопирован в буфер обмена')
      }
    }

    // Копирование пароля
    const copyPassword = async () => {
      if (!formData.password) return

      try {
        await navigator.clipboard.writeText(formData.password)
        notifySuccess('Пароль скопирован в буфер обмена')
      } catch (error) {
        console.error('Ошибка копирования пароля:', error)
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea')
        textArea.value = formData.password
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        notifySuccess('Пароль скопирован в буфер обмена')
      }
    }

    // Очистка при размонтировании компонента
    onUnmounted(() => {
      document.body.style.overflow = ''
    })

    return {
      isSubmitting,
      isGenerating,
      showCurrentPassword,
      formData,
      handleSubmit,
      closeModal,
      generateLoginPassword,
      copyConnectionString,
      copyLogin,
      copyPassword
    }
  }
}
</script>
