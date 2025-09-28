import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/strapi'

export const useCarsStore = defineStore('cars', () => {
  const cars = ref([])

  function transformCarData(item) {
    const data = item.data || item
    const attributes = data.attributes || {}

    return {
      id: data.id,
      documentId: data.documentId || '',
      make: attributes.make || data.make || 'Не указана',
      model: attributes.model || data.model || 'Не указана',
      year: attributes.year || data.year || new Date().getFullYear(),
      licensePlate: attributes.licensePlate || data.licensePlate || 'Не указан',
      vin: attributes.vin || data.vin || '',
      createdAt: attributes.createdAt || data.createdAt || new Date().toISOString(),
      clientId: attributes.client?.data?.id || data.client?.id || null,
      client: attributes.client?.data || data.client || null,
      ...attributes,
      ...data
    }
  }

  async function fetchCars() {
    try {
      const response = await api.get('/cars?populate=client&sort=createdAt:desc')
      
      const responseData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data
        
      if (!Array.isArray(responseData)) {
        throw new Error('Некорректная структура ответа API')
      }

      cars.value = responseData.map(transformCarData)
    } catch (error) {
      console.error('Ошибка загрузки автомобилей:', error)
      cars.value = []
      throw error
    }
  }

  async function addCar(car) {
    try {
      if (!car.make?.trim() || !car.model?.trim() || !car.year || !car.licensePlate?.trim()) {
        throw new Error('Все обязательные поля должны быть заполнены')
      }

      const carData = {
        data: {
          make: car.make.trim(),
          model: car.model.trim(),
          year: car.year,
          licensePlate: car.licensePlate.trim(),
          vin: car.vin.trim(),
          client: car.clientId ? car.clientId : null
        }
      }
      
      const response = await api.post('/cars?populate=client', carData)
      await fetchCars()
      return transformCarData(response.data)
    } catch (error) {
      console.error('Ошибка добавления автомобиля:', error)
      throw error
    }
  }

  async function updateCar(id, updatedCar) {
    try {
      if (!updatedCar.make?.trim() || !updatedCar.model?.trim() || !updatedCar.year || 
          !updatedCar.vin?.trim() || !updatedCar.licensePlate?.trim()) {
        throw new Error('Все обязательные поля должны быть заполнены')
      }

      const carData = {
        data: {
          make: updatedCar.make.trim(),
          model: updatedCar.model.trim(),
          year: updatedCar.year,
          licensePlate: updatedCar.licensePlate.trim(),
          vin: updatedCar.vin.trim(),
          client: updatedCar.clientId ? updatedCar.clientId : null
        }
      }
      
      const car = cars.value.find(c => c.id === id)
      const documentId = car?.documentId || id
      
      const response = await api.put(`/cars/${documentId}?populate=client`, carData)
      await fetchCars()
      return transformCarData(response.data)
    } catch (error) {
      console.error('Ошибка обновления автомобиля:', error)
      throw error
    }
  }

  async function removeCar(id) {
    try {
      const car = cars.value.find(c => c.id === id)
      const documentId = car?.documentId || id
      
      await api.delete(`/cars/${documentId}`)
      await fetchCars()
    } catch (error) {
      console.error('Ошибка удаления автомобиля:', error)
      throw error
    }
  }

  function getCarById(id) {
    return cars.value.find(c => c.id === id)
  }

  return {
    cars,
    fetchCars,
    addCar,
    updateCar,
    removeCar,
    getCarById
  }
})
