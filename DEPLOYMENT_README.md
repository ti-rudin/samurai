# 🚀 Инструкция по развертыванию системы управления автосервисом "Samurai"

## 📋 Обзор системы

Система управления автосервисом "Samurai" состоит из 5 основных сервисов, каждый из которых требует отдельного HTTPS домена:

1. **Админ-панель** (admin-front) - порт 1100
2. **Клиентский портал** (main-front) - порт 1101
3. **Интерфейс исполнителей** (in-front) - порт 1102
4. **CMS Strapi** (strapi) - порт 1103
5. **Node-RED** (nodered) - порт 1880

## 🛠️ Системные требования

### Минимальные требования:
- **ОС**: Ubuntu 22.04 LTS (рекомендуется)
- **ОЗУ**: 4 GB
- **Диск**: 20 GB SSD
- **Docker**: версия 20.10+
- **Docker Compose**: версия 2.0+


## 🔑 Получение API токенов Yandex

Для работы системы необходимы API токены от Yandex:

### 1. Yandex OAuth токен
1. Перейдите в [Yandex ID](https://id.yandex.ru/security)
2. Создайте приложение в разделе "Управление приложениями"
3. Получите OAuth токен для аутентификации

### 2. Yandex GPT API токен
1. Перейдите в [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Создайте сервисный аккаунт
3. Получите API ключ для Yandex GPT
4. **Документация**: https://cloud.yandex.ru/docs/iam/operations/iam-token/create

### 3. Yandex Vision API токен
1. В том же сервисном аккаунте включите Vision API
2. Получите API ключ для Vision
3. **Документация**: https://cloud.yandex.ru/docs/vision/

## 🌐 Настройка DNS и доменов

Для корректной работы системы необходимо настроить 5 HTTPS доменов, указывающих на ваш сервер:

### Требуемые домены:
```
a.your-domain.com    → порт 1100 (админ-панель)
your-domain.com      → порт 1101 (клиентский портал)
in.your-domain.com       → порт 1102 (интерфейс исполнителей)
strapi.your-domain.com      → порт 1103 (Strapi CMS)
api.your-domain.com      → порт 1880 (Node-RED)
```

### Настройка в DNS панели:
1. Войдите в панель управления DNS вашего домена
2. Создайте A-записи для каждого субдомена:
   ```
   a.your-domain.com    A    ваш-ip-адрес
   your-domain.com      A    ваш-ip-адрес
   in.your-domain.com       A    ваш-ip-адрес
   strapi.your-domain.com      A    ваш-ip-адрес
   api.your-domain.com      A    ваш-ip-адрес
   ```

### SSL сертификаты:
- Используйте Let's Encrypt для бесплатных SSL сертификатов
- Или настройте собственные SSL сертификаты

## 📥 Установка проекта

### 1. Клонирование репозитория

```bash
# Клонирование проекта
git clone https://github.com/ti-rudin/samurai-monorepo.git
cd samurai-monorepo

# Установка прав доступа
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе текущего:

```bash
cp .env .env.backup
nano .env
```

**Важные переменные для изменения:**

```env
# Yandex API Configuration
YANDEX_PASSPORT_OAUTH_TOKEN=your_yandex_oauth_token_here
YANDEX_GPT_FOLDER_ID=your_yandex_gpt_folder_id
YANDEX_VISION_FOLDER_ID=your_yandex_vision_folder_id
YANDEX_GPT_FOLDER_ID_2=your_second_gpt_folder_id

# Service URLs (измените на ваши домены)
VITE_ADMIN_FRONTEND_URL=https://admin.your-domain.com
VITE_MAIN_FRONTEND_URL=https://www.your-domain.com
VITE_IN_FRONTEND_URL=https://in.your-domain.com
VITE_MAIN_URL=https://www.your-domain.com
VITE_API_URL=https://api.your-domain.com
VITE_STRAPI_URL=https://api.your-domain.com

# CORS настройки (добавьте ваши домены)
VITE_ALLOWED_HOSTS=api.your-domain.com,admin.your-domain.com,www.your-domain.com,in.your-domain.com
CORS_ORIGIN=https://www.your-domain.com,https://admin.your-domain.com,https://in.your-domain.com

# Database Configuration (можно оставить по умолчанию)
DATABASE_CLIENT=sqlite
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_secure_password_here

# JWT Secrets (СГЕНЕРИРУЙТЕ СВОИ!)
JWT_SECRET=your_generated_jwt_secret_here
ADMIN_JWT_SECRET=your_generated_admin_jwt_secret_here
APP_KEYS=your_generated_app_keys_here
```


## 🚀 Запуск системы

### Предварительная сборка образов:

```bash
# Сборка всех образов
docker-compose build

# Альтернативно, для ускорения:
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build
```

### Запуск всех сервисов:

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### Доступ к сервисам:

После успешного запуска сервисы будут доступны по адресам:
- **Админ-панель**: https://a.your-domain.com
- **Клиентский портал**: https://your-domain.com
- **Интерфейс исполнителей**: https://in.your-domain.com
- **Strapi Admin**: https://strapi.your-domain.com/admin
- **Node-RED**: https://api.your-domain.com

## ⚙️ Настройка Strapi

### Первый запуск Strapi

1. Откройте https://strapi.your-domain.com/admin
2. Логин - admin, пароль - Samurai123
Это учетная запись супер-администратора. 

### Создание учетных записей пользователей


1. **Войдите в систему** под  учетной записью супер-администратора

2. **Создайте учетные записи** для менеджеров и механиков:
   - Перейдите в раздел **Settings > Administration > Users**
   - Нажмите **Add new user**
   - Укажите:
     - **Username**: логин пользователя
     - **Email**: email адрес
     - **Password**: пароль
     - **Role**: назначьте роль (Administrator или Mechanic)

3. **Предустановленная учетная запись**:
   - В системе уже создана учетная запись менеджера:
   - **Логин**: `admin`
   - **Пароль**: `samurai123`
   - **Роль**: Manager

### Схема данных

Система поставляется с преднастроенной схемой данных. Все необходимые таблицы (Clients, Cars, Orders, Parts, Work, RepairMonitor) и связи между ними уже созданы и готовы к использованию.

## 🤖 Настройка Node-RED

### Доступ к Node-RED:
- URL: https://api.your-domain.com
- Логин: `admin`
- Временный пароль: `samurai123nr`



### Смена пароля Node-RED:
```bash
# Остановите Node-RED
docker-compose stop nodered

# Войдите в контейнер
docker-compose exec nodered bash

# Измените пароль через npx
npx node-red-admin hash-pw

# Скопируйте новый хеш и замените в settings.js
nano ~/.node-red/settings.js
```

### Смена пароля Strapi:
1. Войдите в админку Strapi
2. Перейдите в Settings > Administration > Change password
3. Укажите новый пароль


## 🚨 Важные замечания

1. **Резервное копирование**: Регулярно создавайте резервные копии базы данных Strapi
2. **SSL сертификаты**: Обновляйте SSL сертификаты до истечения срока
3. **Мониторинг**: Настройте мониторинг доступности всех доменов
4. **Обновления**: Следите за обновлениями Docker образов и перезапускайте сервисы
5. **Безопасность**: Используйте сильные пароли и регулярно их меняйте

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи Docker контейнеров
2. Убедитесь в корректности DNS настроек
3. Проверьте доступность всех портов
4. Убедитесь в корректности переменных окружения

---

**Удачного развертывания! 🎉**
