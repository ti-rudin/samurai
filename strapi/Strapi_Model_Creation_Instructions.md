# Пошаговая инструкция по созданию и изменению моделей в Strapi

## Важная информация о изменениях схемы

⚠️ **ВНИМАНИЕ**: Все изменения схемы данных (Content Types) в Strapi следует производить ТОЛЬКО через административную панель Strapi. Не редактируйте файлы схемы вручную, так как это может привести к потере данных или несовместимости.

### Процесс изменения схемы:
1. Откройте административную панель Strapi
2. Перейдите в **Content-Types Builder**
3. Внесите необходимые изменения в модели
4. **Сохраните изменения**
5. Strapi автоматически:
   - Обновит файлы схемы
   - Создаст/обновит миграции базы данных
   - Перегенерирует API endpoints

### Резервное копирование:
- **Всегда создавайте резервную копию базы данных перед изменениями схемы**
- Тестируйте изменения на staging/dev окружении перед production

## Запуск и доступ к админке

1. Запустите Strapi и откройте административную панель по адресу:  
   http://localhost:1337/admin

2. Войдите под своей учетной записью администратора.

3. В меню слева выберите раздел **Content-Types Builder**.

4. Создайте или измените коллекции (Content Types) для каждой из моделей:

---

### Клиенты (Clients)

- Нажмите **Create new collection type**.
- Введите имя: `Client`.
- Добавьте поля:
  - `name` — Text (Short text)
  - `phone` — Text (Short text)
  - `email` — Email
  - `address` — Text (Long text)
  - `registrationDate` — Date

- Сохраните изменения.

---

### Автомобили (Cars)

- Создайте новый collection type `Car`.
- Добавьте поля:
  - `client` — Relation (Many-to-One) с `Client`
  - `make` — Text (Short text)
  - `model` — Text (Short text)
  - `year` — Number (Integer)
  - `vin` — Text (Short text)
  - `licensePlate` — Text (Short text)
  - `mechanics` — Relation (Many-to-Many) с `User` (для назначения механиков)

- Сохраните изменения.

---

### Заказ-наряды (Orders)

- Создайте новый collection type `Order`.
- Добавьте поля:
  - `client` — Relation (Many-to-One) с `Client`
  - `car` — Relation (Many-to-One) с `Car`
  - `orderstatus` — Enumeration: `new`, `in_progress`, `suspended`, `completed`, `cancelled`, `deleted`
  - `description` — Text (Long text)
  - `notes` — Text (Long text)
  - `estimatedCost` — Number (Decimal)
  - `finalCost` — Number (Decimal)

- Сохраните изменения.

---

### Запчасти (Parts)

- Создайте новый collection type `Part`.
- Добавьте поля:
  - `order` — Relation (Many-to-One) с `Order`
  - `number` — Text (Short text) - артикул запчасти
  - `name` — Text (Short text) - название запчасти
  - `quantity` — Number (Integer) - количество
  - `price` — Number (Decimal) - цена
  - `partstatus` — Enumeration: `pending_from_client`, `need_to_order`, `ordered`, `onbase`
  - `isRecomended` — Boolean - рекомендована ли запчасть

- Сохраните изменения.

---

### Работы (Work)

- Создайте новый collection type `Work`.
- Добавьте поля:
  - `order` — Relation (Many-to-One) с `Order`
  - `name` — Text (Short text) - название работы
  - `description` — Rich Text - описание работы
  - `cost` — Number (Decimal) - стоимость работы
  - `status_of_work` — Enumeration: `pending`, `in_progress`, `completed`
  - `executor` — Relation (Many-to-Many) с `User` - исполнители (множественный выбор)
  - `executorPercentage` — Number (Decimal) - процент вознаграждения исполнителя (0-100)
  - `isRecomended` — Boolean - рекомендована ли работа

- Сохраните изменения.

**Примечание:** Поле `executorPercentage` обязательно к заполнению, если выбран хотя бы один исполнитель.

---

### Мониторинг ремонта (RepairMonitor)

- Создайте новый collection type `RepairMonitor`.
- Добавьте поля:
  - `order` — Relation (Many-to-One) с `Order`
  - `status` — Enumeration (например: `pending`, `in_progress`, `done`)
  - `notes` — Rich Text
  - `updatedAt` — Дата обновления (автоматически)

- Сохраните изменения.

---

5. После создания моделей перейдите в раздел **Settings > Roles & Permissions**.

6. Выберите роль `Public` или `Authenticated` (в зависимости от того, кто будет обращаться к API).

7. В разделе **Permissions** разрешите доступ к нужным действиям (find, findOne, create, update, delete) для созданных моделей.

8. Сохраните настройки.

---

9. Проверьте работу API, сделав запросы через Postman или curl, например:  
   GET http://localhost:1337/api/clients

10. После успешной настройки моделей и разрешений можно интегрировать фронтенд с backend.

---

Если нужна помощь с интеграцией или тестированием, сообщите.
