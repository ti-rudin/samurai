import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import config from '../config.js'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },

  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'order',
    component: () => import('../views/OrderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/uploads/:filename',
    name: 'order-image',
    component: () => import('../views/OrderImageView.vue'),
    meta: { requiresGuest: false } // Доступно без авторизации
  },
  {
    path: '/share/:token',
    name: 'order-share',
    component: () => import('../views/OrderShareView.vue'),
    meta: { requiresGuest: false } // Доступно без авторизации
  },
  {
    path: '/pdf/:filename',
    name: 'pdf-view',
    beforeEnter: (to, from, next) => {
      // Перенаправляем на Strapi uploads
      const filename = to.params.filename;
      const strapiUrl = `${config.STRAPI_URL}/uploads/${filename}`;
      window.location.href = strapiUrl;
    },
    meta: { requiresGuest: false } // Доступно без авторизации
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not done yet
  if (!authStore.isInitialized) {
    await authStore.init()
  }

  const isAuthenticated = authStore.isAuthenticated

  // Redirect to login if authentication is required
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // Redirect to dashboard if user is authenticated and trying to access guest pages
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
