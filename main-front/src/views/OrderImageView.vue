<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-black">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Загрузка изображения...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="text-center">
      <img
        :src="imageUrl"
        :alt="imageAlt"
        class="max-w-full h-auto"
        @load="imageLoaded = true"
        @error="imageError = true"
      />

      <div v-if="imageError" class="mt-4 text-red-600">
        Не удалось загрузить изображение
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import config from '../config.js'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const imageLoaded = ref(false)
const imageError = ref(false)

// Извлекаем filename из параметров маршрута
const filename = computed(() => route.params.filename)

// Функция для получения cookie по имени
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift())
  return null
}

// Получаем хэш из URL параметров
const hash = computed(() => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('hash')
})

// Преобразуем filename в URL изображения Strapi
const imageUrl = computed(() => {
  if (!filename.value) return ''

  // Сначала пытаемся получить реальный URL из cookie
  const storedUrl = getCookie(`order_image_${filename.value}`)
  if (storedUrl) {
    return storedUrl
  }

  // Если есть хэш в URL параметрах, используем его
  if (hash.value) {
    const imagePath = `/uploads/${filename.value}_${hash.value}.png`
    return `${config.STRAPI_URL}${imagePath}`
  }

  // Fallback: формируем URL на основе filename (для обратной совместимости)
  const imagePath = `/uploads/${filename.value}.png`

  return `${config.STRAPI_URL}${imagePath}`
})

// Альтернативный текст для изображения
const imageAlt = computed(() => {
  if (!filename.value) return 'Заказ-наряд'

  // Извлекаем ID заказа из filename
  const parts = filename.value.split('_')
  if (parts.length >= 3 && parts[0] === 'zakaz' && parts[1] === 'naryad') {
    const orderId = parts[2]
    return `Заказ-наряд №${orderId}`
  }

  return 'Заказ-наряд'
})

onMounted(() => {
  // Устанавливаем мета-теги для SEO
  updateMetaTags()

  // Имитируем загрузку
  setTimeout(() => {
    loading.value = false
  }, 500)
})

// Функция для обновления мета-тегов
const updateMetaTags = () => {
  const title = `Заказ-наряд от САМУРАЙ Автоклуб Тверь`
  const description = `Заказ-наряд от САМУРАЙ Автоклуб Тверь - профессиональное обслуживание автомобилей`
  const url = window.location.href

  // Обновляем title
  document.title = title

  // Удаляем существующие мета-теги
  const existingMetaTags = document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name="twitter:"]')
  existingMetaTags.forEach(tag => tag.remove())

  // Добавляем новые мета-теги
  const metaTags = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/logo.svg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: '/logo.svg' }
  ]

  metaTags.forEach(tag => {
    const meta = document.createElement('meta')
    if (tag.name) {
      meta.setAttribute('name', tag.name)
    }
    if (tag.property) {
      meta.setAttribute('property', tag.property)
    }
    meta.setAttribute('content', tag.content)
    document.head.appendChild(meta)
  })
}
</script>

<style scoped>
/* Дополнительные стили для мобильной адаптивности */
@media (max-width: 640px) {
  .min-h-screen {
    padding: 1rem;
  }

  .max-w-md {
    max-width: 100%;
  }
}
</style>
