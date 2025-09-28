import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? `${import.meta.env.VITE_STRAPI_URL}/api`
    : '/api', // Using Vite proxy in dev
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add response interceptor to handle HTML responses
api.interceptors.response.use(response => {
  // Check if response is HTML
  if (typeof response.data === 'string' && response.data.startsWith('<!DOCTYPE html>')) {
    throw new Error('API returned HTML instead of JSON. Check baseURL and proxy settings.');
  }
  return response;
}, error => {
  return Promise.reject(error);
});


// Request interceptor for auth token
api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const authStore = useAuthStore();
    
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.error('Session expired - logging out');
      await authStore.logout();
      window.location.href = '/login';
      return Promise.reject(error);
    } else if (error.response?.status === 403) {
      console.error('Access forbidden - check permissions or token');
      // Optionally redirect to login or refresh token
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check CORS configuration or API availability');
    }
    
    // Check for admin role in error response
    if (error.response?.data?.error?.message?.includes('admin access required')) {
      console.error('Admin privileges required');
      await authStore.logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check admin status
export const isAdmin = () => {
  const authStore = useAuthStore();
  return authStore.user?.role?.type === 'admin';
};

export const uploadImage = async (imageData) => {
  const formData = new FormData();
  formData.append('files', imageData, imageData.name);

  console.log('Отправка файла в Strapi:', {
    name: imageData.name,
    type: imageData.type,
    size: imageData.size
  });

  try {
    // Используем прямой URL к Strapi для загрузки файлов, чтобы избежать проблем с прокси
    const uploadUrl = `${import.meta.env.VITE_STRAPI_URL}/api/upload`;
    
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${useAuthStore().token}`
      },
      withCredentials: true
    });
    
    console.log('Ответ от Strapi:', response.data);
    
    // В Strapi 5 структура ответа может быть другой
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const uploadedFile = response.data[0];
      console.log('Загруженный файл:', uploadedFile);
      
      // Пробуем разные варианты получения URL
      const imageUrl = uploadedFile.url || 
                       uploadedFile.formats?.large?.url ||
                       uploadedFile.formats?.medium?.url ||
                       uploadedFile.formats?.small?.url ||
                       uploadedFile.formats?.thumbnail?.url;
      
      if (imageUrl) {
        console.log('URL изображения:', imageUrl);
        return imageUrl;
      }
    }
    
    throw new Error('Не удалось получить URL загруженного изображения');
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    if (error.response) {
      console.error('Данные ответа:', error.response.data);
      console.error('Статус:', error.response.status);
      console.error('Заголовки:', error.response.headers);
    }
    throw error;
  }
};

export default api;
