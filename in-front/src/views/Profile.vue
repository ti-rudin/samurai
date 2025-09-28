<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4 dark:text-white">Профиль пользователя</h1>
    <div v-if="user" class="bg-white dark:bg-gray-800 shadow rounded p-6">
      <p class="dark:text-gray-200"><strong class="dark:text-white">Имя:</strong> {{ user.username || user.email }}</p>
      <p class="dark:text-gray-200"><strong class="dark:text-white">Email:</strong> {{ user.email }}</p>
      <p class="dark:text-gray-200"><strong class="dark:text-white">Роль:</strong> {{ user.role?.name || 'Неизвестно' }}</p>
      <button
        @click="logout"
        class="mt-6 px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
      >
        Выйти из системы
      </button>
    </div>
    <div v-else>
      Загрузка...
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const user = computed(() => authStore.user)

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
