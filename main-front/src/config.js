const config = {
  // URL доменов (все с https://)
  MAIN_URL: import.meta.env.VITE_MAIN_FRONTEND_URL,
  ADMIN_URL: import.meta.env.VITE_ADMIN_FRONTEND_URL,
  IN_URL: import.meta.env.VITE_IN_FRONTEND_URL,
  STRAPI_URL: import.meta.env.VITE_STRAPI_URL ,
  API_URL: import.meta.env.VITE_API_URL,

  // API настройки
  API_BASE_URL: import.meta.env.PROD
    ? `${import.meta.env.VITE_STRAPI_URL}/api`
    : '/api',

  // Соль для генерации токенов поделиться
  SHARE_SALT: import.meta.env.VITE_SHARE_SALT,

  // App настройки
  APP_NAME: 'Самурай Автосервис',
  APP_VERSION: '1.0.0'
};

export default config;
