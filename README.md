# 🚗 Samurai - Car Service Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js Version](https://img.shields.io/badge/Vue.js-3+-blue.svg)](https://vuejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

> **Революционная система управления автосервисом с ИИ** - объединяем headless CMS Strapi, Vue.js и автоматизацию Node-RED для создания мощного решения для автобизнеса.

## 🔥 Что делает Samurai особенным?

### 🤖 Интеллектуальное создание заказ-нарядов
Используйте простые предложения вроде "замена масла, обслуживание шруса" - система автоматически:
- Создаст структурированный заказ-наряд
- Найдет нормочасы для работ
- Подберет необходимые запчасти
- Предложит сопутствующие работы

### 📊 Полная прозрачность бизнеса
- **Мониторинг ремонтов в реальном времени**
- **Детальная финансовая аналитика**
- **Автоматические уведомления клиентов**
- **Персонализированное обслуживание**

### 🚀 Современная архитектура
- **Микросервисы** для масштабируемости
- **AI интеграция** с YandexGPT и Vision API
- **Автоматизация** бизнес-процессов через Node-RED
- **PWA поддержка** для мобильных устройств

## 🏗️ Архитектура системы

```
┌─────────────────────────────────────────────────────────────────┐
│                        Samurai Car Service                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │  Admin      │  │   Client    │  │  Workers    │  │ Node-   │  │
│  │  Panel      │  │   Portal    │  │ Interface   │  │  RED    │  │
│  │  Vue 3      │  │  Vue 3      │  │  Vue 3      │  │ Flows   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Strapi 5 (Headless CMS)                     │
│                    SQLite Database                             │
└─────────────────────────────────────────────────────────────────┘
```

### 🛠️ Компоненты системы

| Компонент | Технологии | Порт | Домен |
|-----------|------------|------|--------|
| **Админ-панель** | Vue 3 + Vite | 1100 | `a.your-domain.com` |
| **Клиентский портал** | Vue 3 + Vite | 1101 | `your-domain.com` |
| **Интерфейс исполнителей** | Vue 3 + Vite | 1102 | `in.your-domain.com` |
| **Strapi CMS** | Strapi 5 + TypeScript | 1103 | `strapi.your-domain.com` |
| **Node-RED** | Node-RED + Flows | 1880 | `api.your-domain.com` |

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** >= 18.0.0
- **Docker** & **Docker Compose**
- **Git**

### Установка в один клик

```bash
# 1. Клонировать репозиторий
git clone https://github.com/ti-rudin/samurai.git
cd samurai

# 2. Запустить систему
docker-compose up -d

# 3. Открыть в браузере
# Админ-панель: https://a.your-domain.com
# Клиентский портал: https://your-domain.com
```

**Готово! 🎉** Система запущена и готова к работе.

## 🔧 Ручная настройка

### 1. Установка зависимостей

```bash
# Backend (Strapi)
cd strapi && npm install

# Фронтенды
cd ../admin-front && npm install
cd ../main-front && npm install
cd ../in-front && npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

**Обязательные переменные:**
```env
# Yandex AI API
YANDEX_GPT_FOLDER_ID=your_yandex_gpt_folder_id
YANDEX_VISION_FOLDER_ID=your_yandex_vision_folder_id

# URLs (измените на ваши домены)
VITE_ADMIN_FRONTEND_URL=https://a.your-domain.com
VITE_MAIN_FRONTEND_URL=https://your-domain.com
```

### 3. Сборка и запуск

```bash
# Сборка всех образов
docker-compose build

# Запуск системы
docker-compose up -d
```

## 📚 Документация

### 🚀 [Инструкция по развертыванию](DEPLOYMENT_README.md)
Подробное руководство по настройке и запуску в продакшене.

### 📖 [Документация API](https://strapi.samurai.ti-soft.ru/documentation)
Автоматически генерируемая документация Strapi API.

### 🎯 [Техническое задание](main-front/docs/technical_specification.md)
Детальное техническое описание системы.

## 🛠️ Технологии

### Frontend
- **Vue 3** - Прогрессивный JavaScript фреймворк
- **Vite** - Молниеносный билдер
- **Tailwind CSS** - Utility-first CSS
- **Pinia** - Современное управление состоянием
- **Vue Router** - Маршрутизация
- **PWA** - Progressive Web Apps

### Backend
- **Strapi 5** - Headless CMS
- **SQLite** - Легковесная база данных
- **TypeScript** - Типизация

### Автоматизация
- **Node-RED** - Flow-based programming
- **Telegram Bot API** - Уведомления
- **Yandex AI** - Искусственный интеллект

### DevOps
- **Docker** - Контейнеризация
- **Traefik** - Reverse proxy
- **PM2** - Process management
- **Let's Encrypt** - SSL сертификаты

## 🎯 Возможности

### Для владельцев бизнеса
- 📊 **Финансовая аналитика** - детальные отчеты о доходах/расходах
- 👥 **Управление персоналом** - оптимизация загрузки сотрудников
- 📈 **Прогнозирование** - AI-based insights о бизнесе
- 🔄 **Автоматизация** - рутинные процессы на автопилоте

### Для мастеров-приемщиков
- ⚡ **Быстрое создание заказов** - AI-assisted order creation
- 📋 **Мониторинг ремонтов** - реальное время статусов
- 👤 **Клиентская база** - полная история взаимодействий
- 📱 **Мобильный доступ** - работа с любого устройства

### Для механиков
- 🔧 **Персональный дашборд** - актуальные задачи
- ✅ **Отчетность** - фиксация выполненных работ
- 📚 **История ремонтов** - доступ к прошлым заказам
- 💬 **Коммуникация** - интеграция с Telegram

### Для клиентов
- 🌐 **Онлайн-заявки** - 24/7 доступ к сервису
- 👤 **Личный кабинет** - контроль всех автомобилей
- 💰 **Прозрачные цены** - никаких скрытых платежей
- 📱 **Уведомления** - всегда в курсе статуса ремонта

## 🤝 Участие в разработке

Мы приветствуем контрибьюторов! 🚀

### Как внести вклад

1. **Форкните** репозиторий
2. **Создайте** ветку для вашей фичи (`git checkout -b feature/AmazingFeature`)
3. **Зафиксируйте** изменения (`git commit -m 'Add some AmazingFeature'`)
4. **Отправьте** в ветку (`git push origin feature/AmazingFeature`)
5. **Создайте** Pull Request

### Типы контрибуций
- 🐛 **Багфиксы** - исправление ошибок
- ✨ **Новые фичи** - добавление функциональности
- 📚 **Документация** - улучшение руководств
- 🎨 **UI/UX** - улучшение интерфейса
- 🔧 **Оптимизация** - повышение производительности

### Стандарты разработки
- **ESLint** - для JavaScript/TypeScript
- **Prettier** - для форматирования кода
- **Conventional Commits** - для сообщений коммитов

## 📝 Лицензия

Этот проект лицензирован под **MIT License** - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- **Strapi** - за отличный headless CMS
- **Vue.js** - за прогрессивный фреймворк
- **Node-RED** - за мощную автоматизацию
- **Yandex Cloud** - за AI возможности
- **Open Source сообщество** - за вдохновение

## 📞 Контакты

- **Email**: ax.rudin@gmail.com
- **GitHub**: [ti-rudin](https://github.com/ti-rudin)
- **Демо**: [ti-soft.ru/auto-service-ai](https://ti-soft.ru/auto-service-ai)

---

<div align="center">

**Создано с ❤️ для автобизнеса**

[⭐ Поставьте звезду](https://github.com/ti-rudin/samurai) | [🐛 Сообщить о баге](https://github.com/ti-rudin/samurai/issues) | [💬 Обсудить](https://github.com/ti-rudin/samurai/discussions)

</div>
