<template>
  <div class="relative inline-block text-left">
    <button @click="toggleMenu" class="flex items-center focus:outline-none">
      <img
        v-if="user && user.avatar?.url"
        :src="user.avatar.url"
        alt="User Avatar"
        class="w-8 h-8 rounded-full"
      />
      <svg v-else class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
    </button>
    <transition name="fade">
      <div
        v-if="menuOpen"
        class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <div class="py-1">
          <router-link
            to="/profile"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="closeMenu"
          >
            Профиль
          </router-link>
          <button
            @click="logout"
            class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Выйти
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const user = authStore.user

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

async function logout() {
  await authStore.logout()
  closeMenu()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
