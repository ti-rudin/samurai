import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'



const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'app-main',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/clients',
    name: 'clients',
    component: () => import('../views/Clients.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cars',
    name: 'cars',
    component: () => import('../views/Cars.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/Orders.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/orders/:id/edit',
    name: 'order-edit',
    component: () => import('../views/OrderEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-report',
    name: 'financial-report',
    component: () => import('../views/FinancialReport.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/executor',
    name: 'executor',
    component: () => import('../views/Executor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { left: 0, top: 0 }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isGuestRoute = to.matched.some(record => record.meta.guest)
  
  // Initialize auth state if needed
  if (!authStore.isInitialized) {
    await authStore.init()
  }

  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.user?.role?.type === 'admin'

  if (requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (requiresAdmin && !isAdmin) {
    next({ path: '/', query: { error: 'admin-required' } })
  } else if (isGuestRoute && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
