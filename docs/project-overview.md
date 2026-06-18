# Технічний огляд системи TourMaster

## 1. Загальний опис системи

### Призначення

TourMaster — інформаційна система підбору та бронювання турів для туристичної агентства. Система надає два функціональні контури: клієнтський вебсайт для пошуку і бронювання турів та адміністративну панель для керування каталогом, бронюваннями і клієнтською базою.

Система підтримує дві ролі: `CLIENT` (кінцевий клієнт агентства) та `MANAGER` (менеджер агентства з повним доступом до адміністративних функцій).

### Технологічний стек

**Backend:**

| Компонент | Версія |
|---|---|
| Java | 21 |
| Spring Boot | 3.5.14 |
| Spring Security | (входить до Spring Boot 3.5.14) |
| Spring Data JPA / Hibernate | (входить до Spring Boot 3.5.14) |
| PostgreSQL (JDBC-драйвер) | (остання сумісна з Spring Boot 3.5.x) |
| Flyway | (входить до Spring Boot 3.5.14) |
| jjwt (JWT) | 0.12.6 |
| Springdoc OpenAPI | 2.8.4 |
| MapStruct | 1.6.3 |
| Lombok | (остання сумісна) |
| Spring Mail | (входить до Spring Boot 3.5.14) |

**Frontend:**

| Компонент | Версія |
|---|---|
| Angular | 22.0.x |
| TypeScript | ~6.0.2 |
| PrimeNG | 21.1.9 |
| Tailwind CSS | 4.3.x |
| RxJS | ~7.8.0 |
| ng-lazyload-image | 9.1.3 |

**Інфраструктура:**

| Компонент | Версія / деталі |
|---|---|
| PostgreSQL | 16-alpine (Docker-образ) |
| Nginx | 1.27-alpine (Docker-образ) |
| Docker / Docker Compose | — |
| Node.js (build-контейнер) | 22 |
| Maven (build-контейнер) | 3.9 / eclipse-temurin-21 |

### Архітектурний підхід

Система побудована як монолітний REST API-застосунок (Spring Boot) з окремим SPA-фронтендом (Angular). Обидві частини розміщено в єдиному репозиторії (монорепо). У продакшн-середовищі розгортання здійснюється через Docker Compose з чотирма сервісами: база даних, backend, frontend (nginx+SPA) та зовнішній nginx-реверс-проксі.

---

## 2. Архітектура Backend

### Структура пакетів

```
com.tourmaster
├── config/          — SecurityConfig (Spring Security, CORS)
├── controller/      — REST-контролери (точки входу HTTP)
├── service/         — бізнес-логіка
├── repository/      — Spring Data JPA репозиторії + JpaSpecification
├── entity/          — JPA-сутності (відображення таблиць БД)
├── dto/
│   ├── request/     — DTO вхідних даних (Java records з валідацією)
│   └── response/    — DTO вихідних даних (Java records)
├── mapper/          — MapStruct маппери (entity ↔ DTO)
├── exception/       — кастомні винятки та GlobalExceptionHandler
├── security/        — JwtService, JwtAuthFilter, UserDetailsServiceImpl
└── TourMasterApplication.java
```

### Основні модулі та їхня відповідальність

**`config`**
`SecurityConfig` — конфігурація Spring Security: правила доступу до ендпоінтів (permitAll / authenticated / hasRole), підключення `JwtAuthFilter`, налаштування CORS (allowed-origins, методи, заголовки), статeless-сесія, BCryptPasswordEncoder.

**`controller`**
Шість REST-контролерів приймають HTTP-запити, виконують валідацію вхідних даних через Bean Validation (`@Valid`) та делегують логіку сервісному шару. Відповіді формуються як DTO. Помилки обробляються централізовано через `GlobalExceptionHandler` (@RestControllerAdvice), який повертає `ProblemDetail` (RFC 9457).

**`service`**
| Клас | Відповідальність |
|---|---|
| `AuthService` | Реєстрація, вхід, оновлення access token, вихід. Зберігає refresh-токени в БД |
| `TourService` | Пошук і фільтрація турів через `JpaSpecification` (динамічні предикати) |
| `BookingService` | Створення бронювань, зменшення квоти місць, скасування, отримання списку |
| `AdminTourService` | CRUD турів та дат вильоту для адміністративного контуру |
| `AdminBookingService` | Перегляд і зміна статусів бронювань з надсиланням email-сповіщень |
| `AdminClientService` | Перегляд клієнтської бази, профілів, нотаток менеджера |
| `NotificationService` | Асинхронне (@Async) надсилання email через Spring Mail |

**`repository`**
Spring Data JPA репозиторії. `TourSpecification` реалізує `Specification<Tour>` для побудови динамічних JPQL-запитів з фільтрами каталогу.

**`security`**
`JwtService` — генерація та валідація JWT (HMAC-SHA256, бібліотека jjwt 0.12.6).
`JwtAuthFilter` — Servlet-фільтр, що витягує токен з заголовка `Authorization: Bearer <token>`, валідує і встановлює `SecurityContext`.
`UserDetailsServiceImpl` — завантаження `User`-сутності за email для Spring Security.

**`exception`**
`GlobalExceptionHandler` (@RestControllerAdvice) перехоплює: `MethodArgumentNotValidException` (400), `EmailAlreadyExistsException` (409), `InvalidTokenException` (401), `BadCredentialsException` (401), `ResourceNotFoundException` (404), `AuthorizationDeniedException` (403), `BusinessException` (гнучкий статус), загальний `Exception` (500).

**`mapper`**
MapStruct-маппери (`TourMapper`, `BookingMapper`) перетворюють JPA-сутності на response-DTO без ручного копіювання полів.

### Схема взаємодії шарів

```
HTTP Request
    ↓
JwtAuthFilter (перевірка токена, SecurityContext)
    ↓
Controller (@RestController) — валідація @Valid, витяг @AuthenticationPrincipal
    ↓
Service (@Service) — бізнес-логіка, транзакції (@Transactional)
    ↓
Repository (JpaRepository / JpaSpecificationExecutor) — JPQL/SQL, Hibernate ORM
    ↓
PostgreSQL
```

---

## 3. API ендпоінти

Базовий URL: `/api`. Документація доступна за адресою `/swagger-ui.html`.

### 3.1 Auth (`/api/auth`) — PUBLIC

| Метод | Шлях | Призначення | Request body | Відповідь (success) |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Реєстрація нового клієнта | `{ email, password, firstName, lastName, phone? }` | `201` `AuthResponse` |
| `POST` | `/api/auth/login` | Вхід і отримання токенів | `{ email, password }` | `200` `AuthResponse` |
| `POST` | `/api/auth/refresh` | Оновлення access token | `{ refreshToken }` | `200` `AuthResponse` |
| `POST` | `/api/auth/logout` | Видалення refresh-токенів | — (Bearer header) | `204 No Content` |

**`AuthResponse`:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "userId": 1,
  "email": "user@example.com",
  "firstName": "Іван",
  "lastName": "Петренко",
  "role": "CLIENT"
}
```

**Приклад помилки (валідація):**
```json
{
  "title": "Validation failed",
  "status": 400,
  "errors": { "email": "must be a well-formed email address" }
}
```

---

### 3.2 Tours (`/api/tours`) — PUBLIC (GET)

| Метод | Шлях | Призначення | Параметри | Відповідь |
|---|---|---|---|---|
| `GET` | `/api/tours` | Каталог з фільтрами та пагінацією | `q`, `country`, `priceMin`, `priceMax`, `stars[]`, `mealType[]`, `durationMin`, `durationMax`, `departureDateFrom`, `departureDateTo`, `badge`, `page` (def. 0), `size` (def. 12), `sort` (def. `newest`) | `200` `PageResponse<TourSummaryResponse>` |
| `GET` | `/api/tours/search` | Пошук за ключовим словом | `q` (обов.), `page`, `size` | `200` `PageResponse<TourSummaryResponse>` |
| `GET` | `/api/tours/{id}` | Деталі туру | — | `200` `TourDetailResponse` |

**`PageResponse<T>`:**
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 12,
  "totalElements": 48,
  "totalPages": 4
}
```

---

### 3.3 Bookings (`/api/bookings`) — AUTHENTICATED (CLIENT)

| Метод | Шлях | Призначення | Вхідні дані | Відповідь |
|---|---|---|---|---|
| `POST` | `/api/bookings` | Створити бронювання | `{ tourDateId, tourists: [{firstName, lastName, birthDate, passportNumber, passportExpiry}], extraServiceIds? }` | `201` `BookingDetailResponse` |
| `GET` | `/api/bookings/my` | Список бронювань поточного клієнта | `status?`, `page` (def. 0), `size` (def. 10) | `200` `PageResponse<BookingResponse>` |
| `GET` | `/api/bookings/{id}` | Деталі конкретного бронювання | — | `200` `BookingDetailResponse` |
| `POST` | `/api/bookings/{id}/cancel` | Скасувати бронювання | — | `204 No Content` |
| `GET` | `/api/bookings/extra-services` | Перелік доступних додаткових послуг | — | `200` `List<ExtraServiceResponse>` |

**`BookingDetailResponse`** (ключові поля):
```json
{
  "id": 42,
  "tourTitle": "Єгипет, Хургада",
  "departureDate": "2026-08-10",
  "status": "NEW",
  "totalPrice": 35000.00,
  "discount": 0.00,
  "touristsCount": 2,
  "tourists": [ { "firstName": "...", "passportNumber": "..." } ],
  "extraServices": [ { "name": "Страховка", "price": 500.00 } ],
  "createdAt": "2026-06-18T10:00:00"
}
```

---

### 3.4 Admin — Tours (`/api/admin/tours`) — MANAGER

| Метод | Шлях | Призначення | Вхідні дані | Відповідь |
|---|---|---|---|---|
| `GET` | `/api/admin/tours` | Список всіх турів з фільтрами | `q?`, `country?`, `status?`, `page`, `size` | `200` `PageResponse<AdminTourResponse>` |
| `POST` | `/api/admin/tours` | Створити новий тур | `CreateTourRequest` | `201` `TourDetailResponse` |
| `PUT` | `/api/admin/tours/{id}` | Оновити тур | `UpdateTourRequest` | `200` `TourDetailResponse` |
| `DELETE` | `/api/admin/tours/{id}` | Архівувати тур | — | `204 No Content` |
| `POST` | `/api/admin/tours/{id}/dates` | Додати дату вильоту | `{ departureDate, returnDate, departureCity?, totalSeats, priceOverride? }` | `201` `TourDetailResponse` |

---

### 3.5 Admin — Bookings (`/api/admin/bookings`) — MANAGER

| Метод | Шлях | Призначення | Вхідні дані | Відповідь |
|---|---|---|---|---|
| `GET` | `/api/admin/bookings` | Всі бронювання з фільтрами | `status?`, `month?` (yyyy-MM), `page`, `size` | `200` `PageResponse<AdminBookingResponse>` |
| `GET` | `/api/admin/bookings/{id}` | Деталі бронювання | — | `200` `BookingDetailResponse` |
| `PATCH` | `/api/admin/bookings/{id}/status` | Змінити статус бронювання | `{ status }` | `200` `AdminBookingResponse` |

---

### 3.6 Admin — Clients (`/api/admin/clients`) — MANAGER

| Метод | Шлях | Призначення | Вхідні дані | Відповідь |
|---|---|---|---|---|
| `GET` | `/api/admin/clients` | Список клієнтів | `q?`, `page`, `size` | `200` `PageResponse<AdminClientResponse>` |
| `GET` | `/api/admin/clients/{id}` | Профіль клієнта з бронюваннями та нотатками | — | `200` `AdminClientProfileResponse` |
| `POST` | `/api/admin/clients/{id}/notes` | Додати нотатку менеджера до клієнта | `{ text }` | `201` `ManagerNoteResponse` |

---

### 3.7 Admin — Reports (`/api/admin/reports`) — MANAGER

| Метод | Шлях | Призначення | Параметри | Відповідь |
|---|---|---|---|---|
| `GET` | `/api/admin/reports/sales` | Звіт по продажах за період | `from` (ISO date), `to` (ISO date) | `200` `SalesReportResponse` |

**`SalesReportResponse`** містить: `totalRevenue`, `totalBookings`, кількість бронювань за кожним статусом, `dailyRevenue[]` (дата, сума, кількість), `topTours[]` (топ-10 турів за кількістю продажів).

---

## 4. Модель даних

### Перелік сутностей із полями

**`users`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `email` | `VARCHAR(255) UNIQUE NOT NULL` | Email (логін) |
| `password` | `VARCHAR(255) NOT NULL` | BCrypt-хеш паролю |
| `first_name` | `VARCHAR(100) NOT NULL` | Ім'я |
| `last_name` | `VARCHAR(100) NOT NULL` | Прізвище |
| `phone` | `VARCHAR(20)` | Телефон (необов.) |
| `role` | `VARCHAR(20) NOT NULL` | `CLIENT` або `MANAGER` |
| `loyalty_points` | `INT NOT NULL DEFAULT 0` | Бали лояльності |
| `created_at` | `TIMESTAMP NOT NULL` | Дата реєстрації |
| `updated_at` | `TIMESTAMP NOT NULL` | Дата останнього оновлення |

**`tours`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `title` | `VARCHAR(255) NOT NULL` | Назва туру |
| `description` | `TEXT` | Опис |
| `country` | `VARCHAR(100) NOT NULL` | Країна |
| `city` | `VARCHAR(100)` | Місто |
| `hotel_name` | `VARCHAR(255)` | Назва готелю |
| `hotel_stars` | `SMALLINT` | Зірковість (1–5) |
| `meal_type` | `VARCHAR(50)` | Тип харчування (BB, HB, FB, AI) |
| `duration_nights` | `SMALLINT NOT NULL` | Тривалість (ночей) |
| `price_from` | `NUMERIC(12,2) NOT NULL` | Базова ціна |
| `old_price` | `NUMERIC(12,2)` | Стара ціна (для відображення знижки) |
| `badge` | `VARCHAR(50)` | Мітка (HIT, SALE, NEW, LAST_SEATS) |
| `rating` | `NUMERIC(2,1)` | Середній рейтинг відгуків |
| `reviews_count` | `INT` | Кількість відгуків |
| `image_url` | `VARCHAR(512)` | URL головного фото |
| `gallery_urls` | `TEXT[]` | Масив URL галереї |
| `status` | `VARCHAR(20) NOT NULL` | `ACTIVE` або `ARCHIVED` |
| `created_at` / `updated_at` | `TIMESTAMP NOT NULL` | Аудит |

**`tour_dates`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `tour_id` | `BIGINT FK → tours(id)` | Тур |
| `departure_date` | `DATE NOT NULL` | Дата вильоту |
| `return_date` | `DATE NOT NULL` | Дата повернення |
| `departure_city` | `VARCHAR(100)` | Місто вильоту |
| `total_seats` | `INT NOT NULL` | Загальна квота місць |
| `available_seats` | `INT NOT NULL` | Доступні місця |
| `price_override` | `NUMERIC(12,2)` | Перевизначена ціна для дати (якщо відрізняється від `tours.price_from`) |

**`bookings`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `user_id` | `BIGINT FK → users(id)` | Клієнт |
| `tour_date_id` | `BIGINT FK → tour_dates(id)` | Дата вильоту |
| `status` | `VARCHAR(20) NOT NULL` | `NEW`, `CONFIRMED`, `PAID`, `COMPLETED`, `CANCELLED` |
| `total_price` | `NUMERIC(12,2) NOT NULL` | Повна вартість бронювання |
| `discount` | `NUMERIC(12,2) NOT NULL DEFAULT 0` | Знижка |
| `manager_note` | `TEXT` | Примітка менеджера |
| `created_at` / `updated_at` | `TIMESTAMP NOT NULL` | Аудит |

**`booking_items`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `booking_id` | `BIGINT FK → bookings(id)` | Бронювання |
| `first_name` | `VARCHAR(100) NOT NULL` | Ім'я туриста |
| `last_name` | `VARCHAR(100) NOT NULL` | Прізвище туриста |
| `birth_date` | `DATE NOT NULL` | Дата народження |
| `passport_number` | `VARCHAR(50) NOT NULL` | Номер паспорта |
| `passport_expiry` | `DATE NOT NULL` | Термін дії паспорта |

**`extra_services`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `name` | `VARCHAR(255) NOT NULL` | Назва послуги |
| `description` | `TEXT` | Опис |
| `price` | `NUMERIC(10,2) NOT NULL` | Вартість |
| `type` | `VARCHAR(50) NOT NULL` | `INSURANCE`, `TRANSFER`, `EXCURSION` |

**`booking_extra_services`** — зв'язкова таблиця Many-to-Many між `bookings` та `extra_services`.

**`reviews`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `user_id` | `BIGINT FK → users(id)` | Автор |
| `tour_id` | `BIGINT FK → tours(id)` | Тур |
| `booking_id` | `BIGINT FK → bookings(id)` | Бронювання-підстава |
| `rating` | `SMALLINT NOT NULL` | Оцінка 1–5 |
| `comment` | `TEXT` | Коментар |
| `created_at` | `TIMESTAMP NOT NULL` | Дата публікації |

Unique constraint: `(user_id, booking_id)` — один відгук на одне бронювання.

**`refresh_tokens`**

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `token` | `VARCHAR(512) UNIQUE NOT NULL` | JWT refresh-токен |
| `user_id` | `BIGINT FK → users(id)` | Власник |
| `expires_at` | `TIMESTAMP NOT NULL` | Термін дії |
| `created_at` | `TIMESTAMP NOT NULL` | Дата видачі |

**`manager_notes`** (міграція V3)

| Поле | Тип SQL | Опис |
|---|---|---|
| `id` | `BIGSERIAL PK` | Ідентифікатор |
| `user_id` | `BIGINT FK → users(id)` | Клієнт |
| `manager_id` | `BIGINT FK → users(id)` | Менеджер, що залишив нотатку |
| `note` | `TEXT NOT NULL` | Текст нотатки |
| `created_at` | `TIMESTAMP NOT NULL` | Дата |

**`wishlist`** — зв'язкова таблиця `(user_id, tour_id)`, PK — складений ключ.

**`notifications`** — журнал email/push-сповіщень із полями `type`, `subject`, `body`, `sent_at`, `status` (PENDING / SENT / FAILED).

### Зв'язки між таблицями

```
users ──< refresh_tokens         (One-to-Many: один користувач — декілька токенів)
users ──< bookings               (One-to-Many: один клієнт — декілька бронювань)
users ──< reviews                (One-to-Many)
users >──< tours [wishlist]      (Many-to-Many через wishlist)
users ──< manager_notes [user]   (One-to-Many: клієнт — нотатки)
users ──< manager_notes [mgr]    (One-to-Many: менеджер — залишені нотатки)
users ──< notifications          (One-to-Many)

tours ──< tour_dates             (One-to-Many: один тур — декілька дат вильоту)
tours ──< reviews                (One-to-Many)
tours >──< users [wishlist]      (Many-to-Many через wishlist)

tour_dates ──< bookings          (One-to-Many: одна дата — декілька бронювань)

bookings ──< booking_items       (One-to-Many: одне бронювання — декілька туристів)
bookings >──< extra_services     (Many-to-Many через booking_extra_services)
bookings ──< reviews             (One-to-Many, але обмежено UNIQUE на user+booking)
bookings ──< notifications       (One-to-Many)
```

---

## 5. Архітектура Frontend

### Структура папок

```
frontend/src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts        — перевірка isLoggedIn (redirectTo /auth/login)
│   │   └── manager.guard.ts     — перевірка isManager (redirectTo /)
│   ├── interceptors/
│   │   ├── auth.interceptor.ts  — додає Bearer-токен, автоматичне оновлення при 401
│   │   └── error.interceptor.ts — централізована обробка HTTP-помилок
│   ├── models/
│   │   ├── auth.models.ts       — AuthResponse, LoginRequest, RegisterRequest
│   │   ├── tour.models.ts       — TourSummary, TourDetail, TourFilter, PageResponse
│   │   └── booking.models.ts    — BookingDetail, BookingSummary, CreateBookingRequest
│   └── services/
│       ├── auth.service.ts      — стан аутентифікації (Angular Signals), HTTP-виклики
│       ├── tour.service.ts      — каталог, пошук, деталі туру
│       ├── booking.service.ts   — створення, перегляд, скасування бронювань
│       └── cart.service.ts      — тимчасовий стан кошика бронювання
├── shared/
│   └── components/
│       ├── header/              — HeaderComponent (прозорий при скролі)
│       ├── footer/              — FooterComponent
│       └── mobile-tab-bar/      — MobileTabBarComponent (нижня навігація)
└── features/
    ├── home/                    — HomeComponent (головна)
    ├── auth/
    │   ├── login/               — LoginComponent
    │   └── register/            — RegisterComponent
    ├── tours/
    │   ├── catalog/             — TourCatalogComponent
    │   └── detail/              — TourDetailComponent
    ├── booking/
    │   ├── wizard/              — BookingWizardComponent (5-кроковий wizard)
    │   └── success/             — BookingSuccessComponent
    ├── cabinet/
    │   ├── bookings/            — MyBookingsComponent
    │   ├── wishlist/            — WishlistComponent
    │   ├── profile/             — ProfileComponent
    │   └── layout/              — CabinetLayoutComponent
    └── admin/
        ├── dashboard/           — AdminDashboardComponent
        ├── tours/               — AdminToursComponent
        ├── bookings/            — AdminBookingsComponent
        ├── clients/             — AdminClientsComponent
        └── layout/              — AdminLayoutComponent
```

### Основні сторінки та маршрути

| Маршрут | Компонент | Захист | Призначення |
|---|---|---|---|
| `/` | `HomeComponent` | PUBLIC | Головна: hero-секція з пошуком, карусель турів, секції переваг, відгуки |
| `/tours` | `TourCatalogComponent` | PUBLIC | Каталог з боковою панеллю фільтрів, перемикання grid/list, пагінатор |
| `/tours/:id` | `TourDetailComponent` | PUBLIC | Деталі туру: фотогалерея (PrimeNG Galleria), 4 вкладки, sticky-сайдбар |
| `/booking` | `BookingWizardComponent` | `authGuard` | 5-кроковий wizard: вибір дати → туристи → послуги → огляд → оплата |
| `/booking/success` | `BookingSuccessComponent` | `authGuard` | Підтвердження бронювання з номером і CTA |
| `/cabinet/bookings` | `MyBookingsComponent` | `authGuard` | Список бронювань клієнта з фільтрами за статусом |
| `/cabinet/wishlist` | `WishlistComponent` | `authGuard` | Збережені тури |
| `/cabinet/profile` | `ProfileComponent` | `authGuard` | Редагування профілю, зміна паролю |
| `/auth/login` | `LoginComponent` | PUBLIC | Split-layout форма входу |
| `/auth/register` | `RegisterComponent` | PUBLIC | Форма реєстрації з перевіркою надійності паролю |
| `/admin` | `AdminDashboardComponent` | `managerGuard` | Stat cards, останні бронювання, топ турів |
| `/admin/tours` | `AdminToursComponent` | `managerGuard` | Таблиця турів, пошук, фільтр, архівування |
| `/admin/bookings` | `AdminBookingsComponent` | `managerGuard` | Таблиця бронювань, inline зміна статусу |
| `/admin/clients` | `AdminClientsComponent` | `managerGuard` | База клієнтів, рівні лояльності |

Усі маршрути використовують `loadComponent` (lazy loading). Неіснуючі маршрути перенаправляються на `/`.

### Робота з API

**Сервіси** (`core/services/`) — `Injectable({ providedIn: 'root' })` синглтони. Кожен сервіс звертається до `environment.apiUrl` і повертає `Observable` через `HttpClient`.

**Interceptors** — підключені через `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))` в `app.config.ts`:
- `authInterceptor` — клонує кожен запит і додає заголовок `Authorization: Bearer <accessToken>`. При отриманні `401` (крім запитів до `/auth/`) автоматично викликає `POST /api/auth/refresh`, повторює оригінальний запит з новим токеном. Якщо оновлення також невдале — викликає `auth.logout()` і перекидає помилку.
- `errorInterceptor` — централізована обробка помилок HTTP.

**Стан аутентифікації** — `AuthService` зберігає поточного користувача в Angular Signal (`signal<AuthResponse | null>`). Токени зберігаються в `localStorage` за ключами `tm_access`, `tm_refresh`, `tm_user`. Computed-сигнали `isLoggedIn` та `isManager` доступні в компонентах без підписок.

**Типи** — TypeScript-інтерфейси в `core/models/` відображають backend DTO 1-до-1.

---

## 6. Безпека та авторизація

### Механізм аутентифікації

Система використовує stateless JWT-аутентифікацію без серверних сесій.

**Потік входу:**
1. Клієнт надсилає `POST /api/auth/login` з `{email, password}`.
2. `AuthService` (backend) перевіряє облікові дані через `DaoAuthenticationProvider` + `BCryptPasswordEncoder`.
3. Генерується access token (HMAC-SHA256, TTL 15 хв) і refresh token (TTL 7 днів).
4. Refresh token зберігається в таблиці `refresh_tokens`.
5. Обидва токени повертаються клієнту в `AuthResponse`.

**Потік авторизації запитів:**
1. Фронтенд додає `Authorization: Bearer <accessToken>` до кожного запиту через `authInterceptor`.
2. `JwtAuthFilter` (backend) перехоплює запит, витягує і перевіряє токен (`JwtService.isTokenValid`).
3. При валідному токені встановлює `UsernamePasswordAuthenticationToken` у `SecurityContextHolder`.
4. Spring Security застосовує правила доступу з `SecurityFilterChain`.

**Оновлення токена:**
- При отриманні `401` фронтендовий `authInterceptor` автоматично запитує `POST /api/auth/refresh`.
- Backend перевіряє refresh token в БД, генерує новий access token і повертає оновлений `AuthResponse`.

### Ролі та права доступу

| Ресурс | Роль |
|---|---|
| `GET /api/tours/**`, `/api/auth/**`, `/actuator/health`, `/swagger-ui/**` | PUBLIC |
| `POST /api/bookings`, `GET /api/bookings/**` | Будь-який аутентифікований (CLIENT) |
| `GET /api/admin/**`, `POST /api/admin/**`, `PUT /api/admin/**`, `PATCH /api/admin/**`, `DELETE /api/admin/**` | `MANAGER` |

На рівні фронтенду:
- `authGuard` — перевіряє `AuthService.isLoggedIn`. При `false` перенаправляє на `/auth/login` зі збереженням `returnUrl`.
- `managerGuard` — перевіряє `AuthService.isManager`. При `false` перенаправляє на `/`.

Паролі зберігаються виключно у вигляді BCrypt-хешу (Spring Security `BCryptPasswordEncoder`). Сирий пароль ніде не логується і не зберігається.

---

## 7. Розгортання

### Збірка та запуск (локально)

**Backend:**
```
# Запуск через IntelliJ IDEA: Run → TourMasterApplication
# (Maven CLI не використовується через SSL-проблему з корпоративними сертифікатами)
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps   # обов'язково: конфлікт peer deps PrimeNG 21 + Angular 22

# Крок 1 — генерація Tailwind CSS (одноразово або після змін стилів)
npm run tw:build                 # tailwindcss -i src/tailwind.css -o src/tailwind-out.css

# Крок 2 — dev server
ng serve                         # http://localhost:4200

# Розробка з hot-reload Tailwind (два термінали)
npm run tw:watch                 # Термінал 1
ng serve                         # Термінал 2

# Production build
ng build --configuration production
```

### Docker Compose (повний стек)

```bash
cp .env.example .env             # заповнити секрети
docker-compose up --build
```

Compose піднімає чотири сервіси:

| Сервіс | Образ | Порт | Опис |
|---|---|---|---|
| `db` | `postgres:16-alpine` | внутрішній | PostgreSQL, persistent volume `postgres_data` |
| `backend` | multi-stage build (maven:3.9 → eclipse-temurin:21-jre-alpine) | внутрішній 8080 | Spring Boot JAR |
| `frontend` | Node 22 build → nginx:1.27-alpine | внутрішній | Angular SPA |
| `nginx` | `nginx:1.27-alpine` | `80:80` | Reverse proxy |

Backend стартує лише після успішного healthcheck БД (`pg_isready`). Власний healthcheck backend: `GET /actuator/health`.

### Конфігурація та змінні середовища

Усі чутливі значення задаються через змінні середовища. `application.yml` використовує синтаксис `${VAR:default}`.

| Змінна | Default (dev) | Опис |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/tourmaster` | JDBC URL |
| `DB_USERNAME` | `postgres` | Користувач БД |
| `DB_PASSWORD` | `postgres` | Пароль БД |
| `JWT_SECRET` | (тестовий рядок) | HMAC-ключ (≥256 біт, змінити в prod) |
| `JWT_ACCESS_EXPIRATION` | `900000` (15 хв у мс) | TTL access token |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7 діб у мс) | TTL refresh token |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP-хост |
| `MAIL_PORT` | `587` | SMTP-порт |
| `MAIL_USERNAME` | `noreply@tourmaster.ua` | Email відправника |
| `MAIL_PASSWORD` | — | Пароль SMTP |
| `FRONTEND_URL` | `http://localhost:4200` | CORS allowed-origin |

Міграції схеми виконуються Flyway автоматично при старті (`flyway.enabled: true`). Файли міграцій: `V1__init_schema.sql`, `V2__seed_data.sql`, `V3__manager_notes.sql`.

Swagger UI доступний за адресою `/swagger-ui.html` (налаштовано `springdoc.swagger-ui.path`).
