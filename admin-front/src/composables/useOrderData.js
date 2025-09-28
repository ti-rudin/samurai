import { ref } from 'vue';
import { useClientsStore } from '../stores/clients';
import { useCarsStore } from '../stores/cars';
import { useExecutors } from './useExecutors';

export function useOrderData() {
  const loading = ref(false);
  const error = ref(null);
  const { loadExecutors: loadExecutorsFromComposable } = useExecutors();

  // Загрузка клиентов
  const loadClients = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const clientsStore = useClientsStore();
      if (clientsStore.clients.length === 0) {
        await clientsStore.fetchClients();
      }
      
      return clientsStore.clients;
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки клиентов';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Загрузка автомобилей
  const loadCars = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const carsStore = useCarsStore();
      if (carsStore.cars.length === 0) {
        await carsStore.fetchCars();
      }
      
      return carsStore.cars;
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки автомобилей';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Загрузка исполнителей
  const loadExecutors = async () => {
    return await loadExecutorsFromComposable();
  };

  return {
    loading,
    error,
    loadClients,
    loadCars,
    loadExecutors
  };
}
