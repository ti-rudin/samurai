import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/strapi'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([])

  function transformClientData(item) {
    // Обрабатываем как прямой объект, так и ответ API Strapi v4
    const data = item.data || item
    const attributes = data.attributes || {}

    return {
      id: data.id,
      documentId: data.documentId || '',
      name: attributes.name || data.name || 'Без имени',
      phone: attributes.phone || data.phone || 'Не указан',
      address: attributes.address || data.address || '',
      registrationDate: attributes.registrationDate || data.registrationDate || new Date().toISOString().split('T')[0],
      createdAt: attributes.createdAt || data.createdAt || new Date().toISOString(),
      notes: '', // Deprecated field kept for backward compatibility
      cars: attributes.cars?.data || data.cars?.data || [],
      user: attributes.user?.data || data.user?.data || data.user || null,
      ...attributes,
      ...data
    }
  }

  async function fetchClients() {
    try {
      // Загружаем клиентов с данными о пользователях и автомобилях, отсортированными по дате создания (новые первыми)
      const response = await api.get('/clients?populate=user&populate=cars&sort=createdAt:desc')

      const responseData = Array.isArray(response.data)
        ? response.data
        : response.data?.data

      if (!Array.isArray(responseData)) {
        throw new Error('Некорректная структура ответа API')
      }

      clients.value = responseData.map(transformClientData)
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error)
      clients.value = []
      throw error
    }
  }

  async function addClient(client) {
    try {
      // Validate required fields
      if (!client.name?.trim() || !client.phone?.trim()) {
        throw new Error('Имя и телефон обязательны для заполнения')
      }

      const clientData = {
        data: {
          name: client.name.trim(),
          phone: client.phone.trim(),
          address: client.address?.trim() || '',
          registrationDate: client.registrationDate || new Date().toISOString().split('T')[0],
          verified: client.verified || false
        }
      }

      // Если передан userId, связываем пользователя с клиентом
      if (client.userId) {
        clientData.data.user = client.userId
      }

      const response = await api.post('/clients', clientData)

      // Если был передан userId, обновляем пользователя, чтобы установить обратную связь
      if (client.userId) {
        try {
          // Сначала получаем текущие данные пользователя
          const userResponse = await api.get(`/users/${client.userId}`)
          const currentUser = userResponse.data

          // Обновляем пользователя со всеми полями + client
          await api.put(`/users/${client.userId}`, {
            username: currentUser.username,
            email: currentUser.email,
            client: response.data.data.id
          })
          console.log('User updated with client link')
        } catch (userUpdateError) {
          console.error('Ошибка обновления пользователя:', userUpdateError)
          // Не прерываем процесс, если обновление пользователя не удалось
        }
      }

      // Refresh the full list to ensure consistency
      await fetchClients()
      return transformClientData(response.data)
    } catch (error) {
      console.error('Ошибка добавления клиента:', error)
      throw error
    }
  }

  async function updateClient(id, updatedClient) {
    try {
      // Validate required fields
      if (!updatedClient.name?.trim() || !updatedClient.phone?.trim()) {
        throw new Error('Имя и телефон обязательны для заполнения')
      }

      // Find existing client
      const existingClient = clients.value.find(c => c.id === id)
      if (!existingClient) {
        throw new Error('Клиент не найден')
      }

      // Update client data
      const clientData = {
        data: {
          name: updatedClient.name.trim(),
          phone: updatedClient.phone.trim(),
          address: updatedClient.address?.trim() || '',
          registrationDate: updatedClient.registrationDate,
          verified: updatedClient.verified || false
        }
      }

      // Если передан userId, связываем пользователя с клиентом
      if (updatedClient.userId) {
        clientData.data.user = updatedClient.userId
      }

      // Используем documentId вместо id для Strapi v4
      const documentId = existingClient?.documentId || id

      const response = await api.put(`/clients/${documentId}`, clientData)

      // Refresh the full list to ensure consistency
      await fetchClients()
      return transformClientData(response.data)
    } catch (error) {
      console.error('Ошибка обновления клиента:', error)
      throw error
    }
  }

  async function removeClient(id) {
    try {
      // Find existing client
      const client = clients.value.find(c => c.id === id)
      if (!client) {
        throw new Error('Клиент не найден')
      }

      // Delete client
      const documentId = client?.documentId || id
      await api.delete(`/clients/${documentId}`)

      // Refresh the full list to ensure consistency
      await fetchClients()
    } catch (error) {
      console.error('Ошибка удаления клиента:', error)
      throw error
    }
  }

  function getClientById(id) {
    return clients.value.find(c => c.id === id)
  }

  return {
    clients,
    fetchClients,
    addClient,
    updateClient,
    removeClient,
    getClientById
  }
})
