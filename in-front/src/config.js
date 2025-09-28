const config = {
  // URL доменов (все с https://)
  IN_URL: import.meta.env.VITE_IN_FRONTEND_URL,
  ADMIN_URL: import.meta.env.VITE_ADMIN_FRONTEND_URL,
  MAIN_URL: import.meta.env.VITE_MAIN_URL,
  STRAPI_URL: import.meta.env.VITE_STRAPI_URL,
  API_URL: import.meta.env.VITE_API_URL,

  // API настройки
  API_BASE_URL: import.meta.env.PROD
    ? `${import.meta.env.VITE_STRAPI_URL}/api`
    : '/api',

  // App настройки
  APP_NAME: 'In Frontend',
  APP_VERSION: '1.0.0'
};

export default config;
