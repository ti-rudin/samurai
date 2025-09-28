// Загружаем переменные окружения из .env файла
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'admin-frontend-dev',
      cwd: '/home/rudin/samurai-monorepo/admin-front',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: process.env.PORT_ADMIN_FRONT || 1100,
        NODE_ENV: process.env.NODE_ENV || 'development',
        VITE_PORT: process.env.PORT_ADMIN_FRONT || 1100,
        VITE_STRAPI_URL: process.env.VITE_STRAPI_URL,
        VITE_ALLOWED_HOSTS: process.env.VITE_ALLOWED_HOSTS,
        VITE_ADMIN_FRONTEND_URL: process.env.VITE_ADMIN_FRONTEND_URL,
        VITE_MAIN_URL: process.env.VITE_MAIN_URL,
        VITE_API_URL: process.env.VITE_API_URL,
        VITE_SHARE_SALT: process.env.VITE_SHARE_SALT,
        CORS_ORIGIN: process.env.CORS_ORIGIN
      },
      error_file: './logs/err-dev.log',
      out_file: './logs/out-dev.log',
      log_file: './logs/combined-dev.log',
      time: true
    },
    {
      name: 'main-front-dev',
      cwd: '/home/rudin/samurai-monorepo/main-front',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: process.env.PORT_MAIN_FRONT || 1101,
        NODE_ENV: process.env.NODE_ENV || 'development',
        VITE_PORT: process.env.PORT_MAIN_FRONT || 1101,
        VITE_STRAPI_URL: process.env.VITE_STRAPI_URL,
        VITE_ALLOWED_HOSTS: process.env.VITE_ALLOWED_HOSTS,
        VITE_MAIN_FRONTEND_URL: process.env.VITE_MAIN_FRONTEND_URL,
        VITE_ADMIN_FRONTEND_URL: process.env.VITE_ADMIN_FRONTEND_URL,
        VITE_IN_FRONTEND_URL: process.env.VITE_IN_FRONTEND_URL,
        VITE_API_URL: process.env.VITE_API_URL,
        VITE_SHARE_SALT: process.env.VITE_SHARE_SALT,
      },
      error_file: './logs/err-dev.log',
      out_file: './logs/out-dev.log',
      log_file: './logs/combined-dev.log',
      time: true
    },
    {
      name: 'in-front-dev',
      cwd: '/home/rudin/samurai-monorepo/in-front',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: process.env.PORT_IN_FRONT || 1102,
        NODE_ENV: process.env.NODE_ENV || 'development',
        VITE_PORT: process.env.PORT_IN_FRONT || 1102,
        VITE_STRAPI_URL: process.env.VITE_STRAPI_URL,
        VITE_ALLOWED_HOSTS: process.env.VITE_ALLOWED_HOSTS,
        VITE_IN_FRONTEND_URL: process.env.VITE_IN_FRONTEND_URL,
        VITE_ADMIN_FRONTEND_URL: process.env.VITE_ADMIN_FRONTEND_URL,
        VITE_MAIN_URL: process.env.VITE_MAIN_URL,
        VITE_API_URL: process.env.VITE_API_URL
      },
      error_file: './logs/err-dev.log',
      out_file: './logs/out-dev.log',
      log_file: './logs/combined-dev.log',
      time: true
    },
    {
      name: 'strapi-dev',
      cwd: '/home/rudin/samurai-monorepo/strapi',
      script: 'npm',
      args: 'run develop',
      env: {
        PORT: process.env.PORT_STRAPI || 1103,
        NODE_ENV: process.env.NODE_ENV || 'development',
        DATABASE_FILENAME: process.env.DATABASE_FILENAME || 'data.db',
        VITE_STRAPI_URL: process.env.VITE_STRAPI_URL,
        STRAPI_ADMIN_BACKEND_URL: process.env.VITE_STRAPI_URL,
        VITE_ALLOWED_HOSTS: process.env.VITE_ALLOWED_HOSTS,
        VITE_MAIN_FRONTEND_URL: process.env.VITE_MAIN_FRONTEND_URL,
        VITE_ADMIN_FRONTEND_URL: process.env.VITE_ADMIN_FRONTEND_URL,
        VITE_IN_FRONTEND_URL: process.env.VITE_IN_FRONTEND_URL,
        VITE_API_URL: process.env.VITE_API_URL,

        APP_KEYS: process.env.APP_KEYS,
        PUBLIC_URL: process.env.VITE_STRAPI_URL,
        ADMIN_URL: process.env.ADMIN_URL || '/admin',
        HOST: process.env.HOST || '0.0.0.0',

        API_TOKEN_SALT: process.env.API_TOKEN_SALT,
        ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        TRANSFER_TOKEN_SALT: process.env.TRANSFER_TOKEN_SALT,
        VITE_SHARE_SALT: process.env.VITE_SHARE_SALT,
        TRANSFER_TOKEN: process.env.TRANSFER_TOKEN,
        CORS_ORIGIN: process.env.CORS_ORIGIN,

      },
      error_file: './logs/err-dev.log',
      out_file: './logs/out-dev.log',
      log_file: './logs/combined-dev.log',
      time: true
    }
  ]
}
