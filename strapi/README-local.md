# Локальный запуск Strapi

## Требования
- Node.js 18-22
- npm

## Установка
1. Перейти в папку strapi5:
```bash
cd strapi5
```

2. Установить зависимости:
```bash
npm install
```

3. Запустить Strapi в режиме разработки:
```bash
npm run develop
```

## Настройки
- Сервер запускается на `http://localhost:1337`
- Админка доступна по `http://localhost:1337/admin`
- Внешний URL: `https://strapi.autoclub-samurai.ru` (проксируется через traefik)

## Переменные окружения
Создайте файл `.env` если нужно переопределить:
```
HOST=0.0.0.0
PORT=1337
PUBLIC_URL=https://strapi.autoclub-samurai.ru
