import { defineStore } from 'pinia'
import api from '@/api/strapi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    status: 'out',
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    userEmail: (state) => state.user?.email,
    userId: (state) => state.user?.id,
    isAdmin: (state) => state.user?.role?.type === 'admin'
  },

  actions: {
    async init() {
      if (this.isInitialized) return this.user
      
      this.loading = true
      try {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('jwt')
        
        if (userData && token) {
          this.user = JSON.parse(userData)
          this.token = token
          this.status = 'in'
        } else {
          this.status = 'out'
        }
      } catch (error) {
        console.error('Auth init error:', error)
        this.logout()
      } finally {
        this.isInitialized = true
        this.loading = false
      }
      return this.user
    },

    async loginWithEmail(email, password) {
      this.loading = true
      this.error = null
      
      try {
        // 1. Основная аутентификация
        const authResponse = await api.post('/auth/local', {
          identifier: email,
          password: password
        })

        if (!authResponse.data?.jwt) {
          throw new Error('Ошибка: токен не получен')
        }

        // 2. Сохраняем базовые данные
        this.user = authResponse.data.user
        this.token = authResponse.data.jwt
        this.status = 'in'
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('jwt', this.token)

        // 3. Дополнительные данные (не блокируем)
        try {
          const userResponse = await api.get('/users/me?populate=role')
          if (userResponse.data) {
            this.user = {
              ...this.user,
              ...userResponse.data
            }
            localStorage.setItem('user', JSON.stringify(this.user))
          }
        } catch (error) {
          console.error('Ошибка загрузки доп. данных:', error)
        }

        return this.user
      } catch (error) {
        console.error('Ошибка входа:', error)
        this.error = error.response?.data?.error?.message || 
                   error.message || 
                   'Ошибка входа. Проверьте данные.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        localStorage.removeItem('user')
        localStorage.removeItem('jwt')
        this.user = null
        this.token = null
        this.status = 'out'
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
