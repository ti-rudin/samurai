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

          // Не обновляем данные клиента при инициализации, используем сохраненные
          // await this.refreshClientData()
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

        // 3. Дополнительные данные пользователя с ролью (не блокируем)
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
          console.error('Ошибка загрузки доп. данных пользователя:', error)
        }

        // 4. Дополнительные данные (не блокируем)
        try {
          // Пытаемся получить данные из localStorage (если они были сохранены ранее)
          const storedUserData = localStorage.getItem('user')
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData)
            if (parsedUserData.client) {
              this.user = {
                ...this.user,
                client: parsedUserData.client
              }
            }
          }

          // Пробуем получить свежие данные клиента
          if (!this.user.client) {
            try {
              // Получаем список клиентов с populate user
              const clientsPopulate = await api.get('/clients?populate=user')

              if (clientsPopulate.data?.data && clientsPopulate.data.data.length > 0) {
                // Ищем клиента, привязанного к текущему пользователю
                const userClient = clientsPopulate.data.data.find(client =>
                  client.user?.id === this.user.id
                )

                if (userClient) {
                  // У нас есть клиент для пользователя, загружаем его данные
                  const clientDocumentId = userClient.documentId

                  try {
                    // Запрос по documentId (Strapi v5)
                    const docIdClientResponse = await api.get(`/clients/${clientDocumentId}`)
                    const clientData = docIdClientResponse.data.data || docIdClientResponse.data

                    // Загружаем автомобили отдельно
                    try {
                      const carsResponse = await api.get(`/cars?filters[client][id][$eq]=${clientData.id}&populate=client&sort=createdAt:desc`)
                      clientData.cars = carsResponse.data?.data || []
                    } catch (carsError) {
                      clientData.cars = []
                    }

                    // Загружаем заказы отдельно - пробуем получить заказы через клиента
                    try {
                      // Loading orders for client

                      // Пробуем получить заказы через клиента с populate
                      const clientWithOrdersResponse = await api.get(`/clients/${clientData.documentId}?populate[orders][populate][client]=true&populate[orders][populate][car]=true&populate[orders][populate][works][populate][executor]=true&populate[orders][populate][parts]=true`);

                      let clientOrders = [];
                      if (clientWithOrdersResponse.data?.data?.orders) {
                        clientOrders = Array.isArray(clientWithOrdersResponse.data.data.orders)
                          ? clientWithOrdersResponse.data.data.orders
                          : clientWithOrdersResponse.data.data.orders.data || [];
                        // Orders loaded through client
                      } else {
                        // No orders found through client, trying alternative method

                        // Fallback: получаем все заказы и фильтруем
                        const allOrdersResponse = await api.get('/orders', {
                          params: {
                            populate: {
                              client: true,
                              car: true
                            }
                          }
                        });
                        const allOrders = allOrdersResponse.data?.data || [];

                        // Фильтруем заказы по клиенту на клиенте
                        clientOrders = allOrders.filter(order => order.client?.id === clientData.id);
                      }

                      // Теперь для каждого заказа клиента получаем полные данные
                      const fullOrdersPromises = clientOrders.map(async (order) => {
                        try {
                          const fullOrderResponse = await api.get(`/orders/${order.id}?populate[client]=true&populate[car]=true&populate[works][populate][executor]=true&populate[parts]=true`);
                          return fullOrderResponse.data?.data || fullOrderResponse.data;
                        } catch (error) {
                          console.error(`[auth] Error loading full data for order ${order.id}:`, error);
                          return order; // Возвращаем базовые данные если не удалось загрузить полные
                        }
                      });

                      const fullOrders = await Promise.all(fullOrdersPromises);
                      clientData.orders = fullOrders;
                    } catch (ordersError) {
                      console.error('[auth] Error loading orders:', ordersError);
                      clientData.orders = [];
                    }

                    this.user = {
                      ...this.user,
                      client: clientData
                    }
                  } catch (simpleError) {
                    // Fallback - используем данные из списка клиентов
                    userClient.cars = []
                    userClient.orders = []

                    this.user = {
                      ...this.user,
                      client: userClient
                    }
                  }
                } else {
                  console.warn('Клиент для пользователя не найден')
                }
              }
            } catch (populateError) {
              console.warn('Ошибка загрузки данных клиента:', populateError)
            }
          }

          localStorage.setItem('user', JSON.stringify(this.user))
        } catch (error) {
          // Тихая ошибка, не прерываем процесс входа
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

    async register(email, password, clientData) {
      this.loading = true
      this.error = null

      try {
        // 1. Регистрация пользователя
        const registerResponse = await api.post('/auth/local/register', {
          username: email,
          email: email,
          password: password
        })

        if (!registerResponse.data?.user) {
          throw new Error('Ошибка регистрации пользователя')
        }

        // 2. Создание клиента с привязкой к пользователю
        const clientResponse = await api.post('/clients', {
          data: {
            name: clientData.name,
            phone: clientData.phone,
            address: clientData.address || '',
            registrationDate: new Date().toISOString().split('T')[0],
            verified: false,
            user: registerResponse.data.user.id
          }
        })

        // 3. Обновляем пользователя, чтобы установить связь с клиентом
        await api.put(`/users/${registerResponse.data.user.id}`, {
          client: clientResponse.data.data.id
        })

        // 4. Автоматический вход
        return await this.loginWithEmail(email, password)

      } catch (error) {
        console.error('Ошибка регистрации:', error)
        this.error = error.response?.data?.error?.message ||
                   error.message ||
                   'Ошибка регистрации.'
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
        this.error = null
      } finally {
        this.loading = false
      }
    },

    // Обновление данных клиента
    async refreshClientData() {
      if (!this.isAuthenticated || !this.user?.id) {
        return
      }

      // Всегда пытаемся обновить данные клиента

      try {
        // Получаем свежие данные клиента - пробуем разные варианты фильтра
        let clientsResponse

        try {
          // Если у пользователя уже есть данные клиента, обновляем их
          if (this.user?.client?.id) {
            try {
              // Получаем обновленные данные клиента по его ID
              const clientResponse = await api.get(`/clients/${this.user.client.id}?populate=*`)
              if (clientResponse.data?.data) {
                clientsResponse = { data: { data: [clientResponse.data.data] } }
              } else {
                console.warn('Не удалось получить данные клиента по ID, пробуем найти по username/email')
                throw new Error('Client not found by ID')
              }
            } catch (error) {
              console.warn('Ошибка при получении клиента по ID:', error.message)
              // Если не удалось получить по ID, ищем по username/email
              const allClientsResponse = await api.get('/clients?populate=*')
              if (allClientsResponse.data?.data) {
                const userClient = allClientsResponse.data.data.find(client =>
                  client.username === this.user.username ||
                  client.email === this.user.email
                )
                if (userClient) {
                  clientsResponse = { data: { data: [userClient] } }
                } else {
                  console.warn('Клиент не найден ни по ID, ни по username/email')
                  return
                }
              } else {
                console.warn('Не удалось получить список клиентов')
                return
              }
            }
          } else {
            // Если данных клиента нет, получаем всех клиентов и ищем по другим критериям
            const allClientsResponse = await api.get('/clients?populate=*')
            if (allClientsResponse.data?.data) {
              // Ищем клиента по username или email
              const userClient = allClientsResponse.data.data.find(client =>
                client.username === this.user.username ||
                client.email === this.user.email
              )
              if (userClient) {
                clientsResponse = { data: { data: [userClient] } }
              } else {
                console.warn('Клиент для пользователя не найден среди всех клиентов')
                return
              }
            } else {
              console.warn('Не удалось получить список клиентов')
              return
            }
          }
        } catch (fallbackError) {
          console.warn('Не удалось получить данные клиента:', fallbackError)
          return
        }

        if (clientsResponse.data?.data && clientsResponse.data.data.length > 0) {
          const clientData = clientsResponse.data.data[0]

          // Проверяем, что это действительно клиент текущего пользователя
          if (this.user?.client?.id && clientData.id !== this.user.client.id) {
            console.warn('Получены данные другого клиента, пропускаем обновление')
            return
          }

          // Загружаем автомобили
          try {
            const carsResponse = await api.get(`/cars?filters[client][id][$eq]=${clientData.id}&populate=client&sort=createdAt:desc`)
            clientData.cars = carsResponse.data?.data || []
          } catch (carsError) {
            console.warn('Ошибка загрузки автомобилей, используем пустой массив')
            clientData.cars = []
          }

          // Загружаем заказы с populate - пробуем получить заказы через клиента
          try {
            // Пробуем получить заказы через клиента с populate
            const clientWithOrdersResponse = await api.get(`/clients/${clientData.documentId}?populate[orders][populate][client]=true&populate[orders][populate][car]=true&populate[orders][populate][works][populate][executor]=true&populate[orders][populate][parts]=true`);

            let clientOrders = [];
            if (clientWithOrdersResponse.data?.data?.orders) {
              clientOrders = Array.isArray(clientWithOrdersResponse.data.data.orders)
                ? clientWithOrdersResponse.data.data.orders
                : clientWithOrdersResponse.data.data.orders.data || [];
            } else {
              // Fallback: получаем все заказы и фильтруем
              const allOrdersResponse = await api.get('/orders', {
                params: {
                  populate: {
                    client: true,
                    car: true
                  }
                }
              });
              const allOrders = allOrdersResponse.data?.data || [];

              // Фильтруем заказы по клиенту на клиенте
              clientOrders = allOrders.filter(order => order.client?.id === clientData.id);
            }

            // Теперь для каждого заказа клиента получаем полные данные
            const fullOrdersPromises = clientOrders.map(async (order) => {
              try {
                const fullOrderResponse = await api.get(`/orders/${order.id}?populate[client]=true&populate[car]=true&populate[works][populate][executor]=true&populate[parts]=true`);
                return fullOrderResponse.data?.data || fullOrderResponse.data;
              } catch (error) {
                console.error(`[auth] Error refreshing full data for order ${order.id}:`, error);
                return order; // Возвращаем базовые данные если не удалось загрузить полные
              }
            });

            const fullOrders = await Promise.all(fullOrdersPromises);
            clientData.orders = fullOrders;
          } catch (ordersError) {
            console.warn('[auth] Error refreshing orders:', ordersError);
            clientData.orders = [];
          }

          // Обновляем данные пользователя
          this.user = {
            ...this.user,
            client: clientData
          }

          // Сохраняем в localStorage
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch (error) {
        console.warn('Ошибка обновления данных клиента, но данные уже есть:', error.message)
        // Не выбрасываем ошибку, так как данные клиента могут уже быть загружены
      }
    },

    clearError() {
      this.error = null
    }
  }
})
