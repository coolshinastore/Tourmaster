# TourMaster — Project Context for Claude Code

> Цей файл є основним джерелом контексту для продовження розробки в Claude Code.
> Оновлюй його при кожній значущій зміні архітектури або стеку.

---

## 1. Загальний опис проєкту

**Назва:** Інформаційна система підбору та бронювання турів для агенції «TourMaster»  
**Тип:** Full-stack веб-застосунок (клієнтський сайт + адміністративна панель)  
**Мета:** Надати клієнтам агентства зручний онлайн-інструмент пошуку і бронювання турів, а менеджерам — повноцінний бек-офіс для управління каталогом, бронюваннями та клієнтською базою.

**Дві ролі користувачів:**
- `CLIENT` — кінцевий клієнт агентства (пошук, перегляд, бронювання, особистий кабінет)
- `MANAGER` — менеджер агентства (адміністративна панель `/admin`)

---

## 2. Технічний стек

### Backend

| Компонент | Технологія |
|---|---|
| Мова | Java 21 |
| Фреймворк | Spring Boot 3.x |
| Build tool | Maven |
| База даних | PostgreSQL 16 |
| ORM | Spring Data JPA (Hibernate) |
| Безпека | Spring Security + JWT (Bearer token) |
| Валідація | Spring Validation (Bean Validation 3.0) |
| API документація | Springdoc OpenAPI 3 (Swagger UI на `/swagger-ui.html`) |
| Email | Spring Mail (SMTP) |
| PDF генерація | iText або Apache PDFBox |
| Міграції БД | Flyway |
| Тестування | JUnit 5, Mockito, Spring Boot Test |

**Архітектурний патерн:** REST API, шаруватa архітектура (Controller → Service → Repository)  
**Формат відповідей:** JSON  
**Аутентифікація:** JWT Access Token (15 хв) + Refresh Token (7 днів), заголовок `Authorization: Bearer <token>`

### Frontend

| Компонент | Технологія |
|---|---|
| Фреймворк | **Angular 22** (встановлено замість 18) |
| Мова | TypeScript 6.x |
| Стиль компонентів | Standalone Components (без NgModules) |
| UI-бібліотека | **PrimeNG 21.x** (встановлено замість 17.x) |
| Стилі | **Tailwind CSS 4.x** (CLI-підхід: `tw:build` → `tailwind-out.css`) |
| Управління станом | Angular Signals + `CartService` (кошик бронювань) |
| HTTP | `HttpClient` з перехоплювачами (interceptors) для JWT |
| Маршрутизація | Angular Router із lazy loading |
| Форми | Reactive Forms |
| Зображення | `ng-lazyload-image` |
| PrimeNG компоненти | Carousel, DataView, Dialog, Toast, Rating, Galleria, DatePicker, Paginator, Slider, Select, Drawer, Password, Checkbox |
| Тестування | Jasmine + Karma (unit), Playwright або Cypress (e2e) |

### DevOps / Інфраструктура

| Компонент | Технологія |
|---|---|
| ОС сервера | Ubuntu Server 22.04 LTS |
| Контейнеризація | Docker + Docker Compose |
| Reverse proxy | Nginx |
| Хмара | (за вибором: VPS / DigitalOcean / AWS EC2) |
| CI/CD | GitHub Actions |
| Резервне копіювання | Автоматичний pg_dump раз на добу |

---

## 3. Дизайн системи

> ⚠️ ОБОВ'ЯЗКОВО: На початку кожної сесії виконай `Read frontend/design/README.md`
> Цей файл є єдиним авторитетним джерелом дизайну — токени, компоненти, макети всіх сторінок.

---

## 4. Архітектура системи

### Структура репозиторію (монорепо)

```
tourmaster/
├── backend/                      # Spring Boot проєкт
│   ├── src/main/java/com/tourmaster/
│   │   ├── config/               # SecurityConfig, CorsConfig, OpenApiConfig
│   │   ├── controller/           # REST контролери
│   │   ├── service/              # Бізнес-логіка
│   │   ├── repository/           # Spring Data JPA репозиторії
│   │   ├── entity/               # JPA сутності
│   │   ├── dto/                  # Request/Response DTO
│   │   ├── mapper/               # MapStruct маппери
│   │   ├── exception/            # GlobalExceptionHandler, кастомні винятки
│   │   └── security/             # JwtService, JwtFilter, UserDetailsServiceImpl
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/         # Flyway SQL-міграції (V1__, V2__, ...)
│   └── pom.xml
│
├── frontend/                     # Angular 18 проєкт
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # Interceptors, Guards, Services (singleton)
│   │   │   │   ├── interceptors/ # auth.interceptor.ts, error.interceptor.ts
│   │   │   │   ├── guards/       # auth.guard.ts, manager.guard.ts
│   │   │   │   └── services/     # auth.service.ts, cart.service.ts, tour.service.ts
│   │   │   ├── shared/           # Спільні компоненти, pipes, directives
│   │   │   │   ├── components/   # tour-card, booking-badge, star-rating, skeleton
│   │   │   │   └── pipes/        # currency-uah.pipe.ts, duration.pipe.ts
│   │   │   ├── features/         # Lazy-loaded feature-модулі
│   │   │   │   ├── home/
│   │   │   │   ├── tours/        # Каталог + деталі туру
│   │   │   │   ├── booking/      # 5-кроковий wizard
│   │   │   │   ├── cabinet/      # Особистий кабінет клієнта
│   │   │   │   ├── auth/         # Авторизація / реєстрація
│   │   │   │   └── admin/        # Адмін-панель (lazy, захищена guard)
│   │   │   │       ├── dashboard/
│   │   │   │       ├── tours/
│   │   │   │       ├── bookings/
│   │   │   │       └── clients/
│   │   │   └── app.routes.ts
│   │   ├── assets/
│   │   ├── environments/
│   │   └── styles.scss           # Глобальні стилі + PrimeNG тема
│   ├── angular.json
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml
├── nginx.conf
└── CLAUDE.md                     # ← цей файл
```

### База даних — основні сутності

```
users          — клієнти та менеджери (role: CLIENT | MANAGER)
tours          — каталог турів
tour_dates     — дати вильотів і квоти місць для кожного туру
bookings       — бронювання (зв'язок user ↔ tour_date)
booking_items  — туристи у бронюванні (паспортні дані)
extra_services — додаткові послуги (страховка, трансфер, екскурсії)
reviews        — відгуки клієнтів на тури
wishlist       — збережені тури клієнта
notifications  — журнал email/push-сповіщень
```

### REST API — основні ендпоінти

| Метод | Шлях | Роль | Опис |
|---|---|---|---|
| `POST` | `/api/auth/register` | PUBLIC | Реєстрація клієнта |
| `POST` | `/api/auth/login` | PUBLIC | Вхід, отримання JWT |
| `POST` | `/api/auth/refresh` | PUBLIC | Оновлення access token |
| `GET` | `/api/tours` | PUBLIC | Каталог з фільтрами та пагінацією |
| `GET` | `/api/tours/{id}` | PUBLIC | Деталі туру |
| `GET` | `/api/tours/search` | PUBLIC | Пошук за параметрами |
| `GET` | `/api/tours/destinations` | PUBLIC | Статистика по країнах (count, priceFrom) |
| `GET` | `/api/tours/latest-reviews` | PUBLIC | Останні відгуки (для головної) |
| `POST` | `/api/bookings` | CLIENT | Створити бронювання |
| `GET` | `/api/bookings/my` | CLIENT | Мої бронювання |
| `GET` | `/api/bookings/{id}` | CLIENT | Деталі бронювання |
| `POST` | `/api/bookings/{id}/cancel` | CLIENT | Скасувати бронювання |
| `GET` | `/api/bookings/extra-services` | CLIENT | Список додаткових послуг |
| `GET` | `/api/bookings/{id}/pdf` | CLIENT | Завантажити PDF |
| `POST` | `/api/reviews` | CLIENT | Залишити відгук |
| `GET` | `/api/users/me` | CLIENT | Профіль поточного користувача |
| `PUT` | `/api/users/me` | CLIENT | Оновити профіль |
| `PATCH` | `/api/users/me/password` | CLIENT | Змінити пароль |
| `GET` | `/api/wishlist` | CLIENT | Список збережених турів |
| `POST` | `/api/wishlist/{tourId}` | CLIENT | Додати тур до wishlist |
| `DELETE` | `/api/wishlist/{tourId}` | CLIENT | Видалити тур з wishlist |
| `GET` | `/api/admin/tours` | MANAGER | Список турів (адмін) |
| `POST` | `/api/admin/tours` | MANAGER | Створити тур |
| `PUT` | `/api/admin/tours/{id}` | MANAGER | Редагувати тур |
| `DELETE` | `/api/admin/tours/{id}` | MANAGER | Архівувати тур |
| `GET` | `/api/admin/bookings` | MANAGER | Всі бронювання |
| `PATCH` | `/api/admin/bookings/{id}/status` | MANAGER | Змінити статус |
| `GET` | `/api/admin/clients` | MANAGER | База клієнтів |
| `GET` | `/api/admin/reports/sales` | MANAGER | Звіт по продажах |

---

## 5. Структура сторінок (маршрутизація)

### Клієнтська частина

| Маршрут | Компонент | Захист |
|---|---|---|
| `/` | `HomeComponent` | PUBLIC |
| `/tours` | `TourCatalogComponent` | PUBLIC |
| `/tours/:id` | `TourDetailComponent` | PUBLIC |
| `/booking` | `BookingWizardComponent` | `AuthGuard` |
| `/booking/success` | `BookingSuccessComponent` | `AuthGuard` |
| `/cabinet` | `CabinetComponent` | `AuthGuard` |
| `/cabinet/bookings` | `MyBookingsComponent` | `AuthGuard` |
| `/cabinet/wishlist` | `WishlistComponent` | `AuthGuard` |
| `/auth/login` | `LoginComponent` | PUBLIC |
| `/auth/register` | `RegisterComponent` | PUBLIC |

### Адміністративна панель

| Маршрут | Компонент | Захист |
|---|---|---|
| `/admin` | `AdminDashboardComponent` | `ManagerGuard` |
| `/admin/tours` | `AdminToursComponent` | `ManagerGuard` |
| `/admin/bookings` | `AdminBookingsComponent` | `ManagerGuard` |
| `/admin/clients` | `AdminClientsComponent` | `ManagerGuard` |

---

## 6. Ключові бізнес-правила

- Бронювання можливе лише для авторизованих клієнтів.
- При зміні статусу бронювання → автоматичне email-сповіщення клієнту.
- Скасування клієнтом допускається не пізніше ніж за 3 доби до дати вильоту.
- Ціна туру фіксується на момент бронювання і не змінюється при подальшій зміні прайсу.
- Відгук можна залишити лише після завершення туру (статус `COMPLETED`).
- Менеджер не може видаляти тури з активними бронюваннями — лише архівувати.
- Квота місць на дату вильоту зменшується при підтвердженні бронювання і відновлюється при скасуванні.

---

## 7. Нефункціональні вимоги

| Параметр | Значення |
|---|---|
| Час відповіді API (пошук) | ≤ 3 секунди |
| Час завантаження головної | ≤ 2 секунди (з'єднання 10 Мбіт/с) |
| Генерація PDF | ≤ 5 секунд |
| Одночасних користувачів | до 200 |
| Доступність (uptime) | ≥ 99 % |
| Доступність (a11y) | WCAG 2.1 AA |

---

## 8. Змінні середовища

### Backend (`application.yml` / `.env`)

```
DB_URL=jdbc:postgresql://localhost:5432/tourmaster
DB_USERNAME=tourmaster_user
DB_PASSWORD=***
JWT_SECRET=<256-bit random string>
JWT_ACCESS_EXPIRATION=900000        # 15 хв у мс
JWT_REFRESH_EXPIRATION=604800000    # 7 днів у мс
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@tourmaster.ua
MAIL_PASSWORD=***
FRONTEND_URL=http://localhost:4200  # CORS origin
```

### Frontend (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

---

## 9. Команди для запуску

```bash
# Backend (компілювати ЛИШЕ через IntelliJ IDEA — SSL проблема з Maven CLI)
# Run → TourMasterApplication

# Frontend — ЗАВЖДИ два кроки:
cd frontend
npm install --legacy-peer-deps   # обов'язковий прапор через конфлікти peer deps

# Крок 1 (одноразово або після змін CSS): генерація Tailwind CSS
npm run tw:build                  # tailwindcss -i src/tailwind.css -o src/tailwind-out.css

# Крок 2: запуск Angular dev server
ng serve

# Для розробки з hot-reload Tailwind — два термінали паралельно:
# Термінал 1:  npm run tw:watch
# Термінал 2:  ng serve

# Docker (повний стек)
docker-compose up --build

# Flyway міграції вручну
cd backend
mvn flyway:migrate

# Build prod
cd frontend && ng build --configuration production
cd backend  && mvn clean package -DskipTests
```

---

## 10. Поточний стан розробки

### Завершено
- [x] Аналіз ринку та конкурентів
- [x] Структура сторінок (draw.io)
- [x] Пояснювальна записка — Розділ 1 (ТЗ + аналітичний огляд)
- [x] Дизайн системи (Claude Design) — токени, компоненти, макети 10 сторінок
- [x] Ініціалізація monorepo
- [x] **Backend: Spring Boot 3.5.14**, Flyway, SecurityConfig, CORS, JWT
- [x] **Backend: сутності та міграції** (V1–V3: users, tours, tour_dates, bookings, booking_items, extra_services, reviews, wishlist, notifications, manager_notes)
- [x] **Backend: Auth API** — register / login / refresh / logout (Spring Security + jjwt 0.12.6)
- [x] **Backend: Tours API** — CRUD + JpaSpecification пошук + пагінація
- [x] **Backend: Bookings API** — створення, скасування, статуси, email-сповіщення (@Async)
- [x] **Backend: Admin API** — тури (архівування), бронювання (зміна статусів), клієнти, нотатки менеджера
- [x] **Frontend: ініціалізація** Angular 22 + PrimeNG 21 + Tailwind 4 (CLI-підхід)
- [x] **Frontend: core** — interceptors (auth, error), guards (auth, manager), services (auth, cart, tour)
- [x] **Frontend: shared** — HeaderComponent (scroll-transparent), FooterComponent, MobileTabBarComponent
- [x] **Frontend: `/`** — HomeComponent (hero + search, carousel, destinations, hot tours, reviews, CTA)
- [x] **Frontend: `/auth/login`** — split layout, reactive form, p-password, returnUrl redirect
- [x] **Frontend: `/auth/register`** — split layout, password strength, terms checkbox, passwordsMatch validator
- [x] **Frontend: `/tours`** — TourCatalogComponent (sidebar filters, grid/list toggle, paginator, real API)
- [x] **Frontend: `/tours/:id`** — TourDetailComponent (Galleria fullscreen, 4 вкладки, sticky sidebar, tourist stepper, wishlist toggle, similar tours — real API)
- [x] **Frontend: `/booking`** — BookingWizardComponent (5 кроків: Тур/дати → Туристи → Послуги → Огляд → Оплата; real API: tour, extra-services, create booking; Toast на помилку)
- [x] **Frontend: `/booking/success`** — BookingSuccessComponent (real API: завантаження деталей бронювання — тур, дати, ціна, туристів)
- [x] **Frontend: `/cabinet`** — CabinetLayoutComponent (wishlist count з API), MyBookingsComponent (real API: getMyBookings size=50, cancel з confirm, кнопки-посилання на тур), WishlistComponent (real API), ProfileComponent (real API: getProfile, updateProfile, changePassword)
- [x] **Frontend: `/admin`** — AdminDashboardComponent, AdminToursComponent, AdminBookingsComponent, AdminClientsComponent — всі підключені до реальних API через `AdminService`

- [x] **Інтеграція** — `angular.json` fileReplacements для production env; `BookingDetailResponse` + mapper отримали `touristsCount`; SecurityConfig відкрив `/actuator/health`
- [x] **Розгортання** — `backend/Dockerfile` (Maven multi-stage), `frontend/Dockerfile` (Node 22 + nginx:1.27-alpine), `docker-compose.yml` (4 сервіси: db/backend/frontend/nginx), `nginx.conf` (reverse proxy), `.env.example`, `.gitignore`, actuator dependency + config
- [x] **Unit-тести Backend** — 39 тестів, `@ExtendWith(MockitoExtension.class)`, без Spring контексту та БД: `AuthServiceTest` (8), `BookingServiceTest` (10), `TourServiceTest` (4), `AdminTourServiceTest` (5), `AdminBookingServiceTest` (7), `JwtServiceTest` (5)
- [x] **Виправлення помилок компіляції Frontend** — `greeting()` → `greeting` у `cabinet-layout.component.html`; видалено невикористаний `RouterLink` з `admin-tours.component.ts`
- [x] **Фікс зсуву контенту під хедер** — `pt-16 md:pt-18` на `<main>` у каталозі, деталі туру, booking-success, cabinet
- [x] **Demo data** — `DataSeeder` (`@Profile("!prod")`) створює клієнтів і менеджера при старті

- [x] **Backend: нові ендпоінти (API-інтеграція)**
  - `GET /api/tours/destinations` — статистика по країнах (GROUP BY + COUNT + MIN price)
  - `GET /api/tours/latest-reviews` — останні відгуки з усіх турів
  - `GET|PUT /api/users/me` — профіль поточного користувача
  - `PATCH /api/users/me/password` — зміна пароля (BCrypt verify)
  - `GET|POST|DELETE /api/wishlist/{tourId}` — управління wishlist
  - Нові entity: `Wishlist`, `WishlistId` (EmbeddedId), `WishlistRepository`
  - Нові DTO: `UpdateProfileRequest`, `ChangePasswordRequest`, `UserProfileResponse`, `DestinationStatsResponse`

- [x] **Frontend: нові сервіси та моделі (API-інтеграція)**
  - `user.service.ts` — getProfile, updateProfile, changePassword, getWishlist, addToWishlist, removeFromWishlist
  - `admin.service.ts` — getTours, archiveTour, getBookings, updateBookingStatus, getClients
  - `tour.service.ts` — додано getDestinations(), getLatestReviews()
  - `admin.models.ts` — `AdminTour`, `AdminBooking`, `AdminClient`
  - `tour.models.ts` — додано `DestinationStats`
  - `auth.service.ts` — додано `patchUser()` для оновлення сигналу після збереження профілю
  - `CabinetLayoutComponent` — wishlist count тепер завантажується всередині layout (не передається як Input)

### Аудит готовності сторінок (2026-06-26)

| Сторінка | Готовність | Що залишилось |
|---|---|---|
| `/` Home | ✅ 100% | — |
| `/tours` Каталог | ✅ 100% | — |
| `/tours/:id` Деталі туру | ✅ 100% | — |
| `/auth/login` | ✅ ~95% | "Забули пароль?" (немає flow), Google OAuth |
| `/auth/register` | ✅ ~95% | Google OAuth |
| `/booking` Wizard | ✅ ~95% | Apple Pay / Розстрочка — UI only, реального шлюзу немає |
| `/booking/success` | ✅ 100% | — |
| `/cabinet/wishlist` | ✅ 100% | — |
| `/cabinet/profile` | ✅ ~95% | "Видалити акаунт" — кнопка без дії |
| `/cabinet/bookings` | ⚠️ ~90% | "⤓ Ваучер" і "★ Відгук" — кнопки без дії |
| `/admin/bookings` | ⚠️ ~90% | "👁 Деталі" — кнопка без modal |
| `/admin/clients` | ⚠️ ~90% | "👁 Деталі" — кнопка без modal |
| `/admin` Dashboard | ⚠️ ~80% | Stat cards і "Топ турів" — хардкодовані значення, не API |
| `/admin/tours` | ⚠️ ~75% | "➕ Додати тур" і "✏️ Редагувати" — кнопки без форми |

### В роботі / Наступні кроки (пріоритет)

**Критичні:**
- [ ] **Admin Dashboard stats** — підключити stat cards і топ-тури до реального API (`/api/admin/reports/sales` або окремий ендпоінт)
- [ ] **Форма створення/редагування туру** (`/admin/tours`) — modal/сторінка з полями: title, country, city, hotel, price, dates, etc.
- [ ] **Форма відгуку** (`POST /api/reviews`) — modal у MyBookings після `status === COMPLETED`

**Другорядні:**
- [ ] **PDF-ваучер** (`GET /api/bookings/{id}/pdf`) — backend + кнопка "⤓ Ваучер" у MyBookings
- [ ] **Modal деталей** клієнта та бронювання в адмін-панелі
- [ ] **"Забули пароль?"** — flow для скидання пароля через email
- [ ] **Видалення акаунта** — `DELETE /api/users/me` з підтвердженням

**Навмисні заглушки (не потребують реалізації для MVP):**
- Apple Pay / Google Pay / Розстрочка — оплата через реальний платіжний шлюз (Stripe / LiqPay) виходить за межі курсової роботи
- Google OAuth — виходить за межі курсової роботи
- `MOCK_TOUR` у `tour-detail` та `booking-wizard` — graceful fallback при недоступності API, залишається навмисно

---

## 11. Важливі рішення та обґрунтування

| Рішення | Обґрунтування |
|---|---|
| Angular Signals (не NgRx) | Простіша модель стану для проєкту такого масштабу; вбудована реактивність без додаткових залежностей |
| Standalone Components | Angular 22 best practice; менше бойлерплейту, кращий tree-shaking |
| PrimeNG (не Angular Material) | Багатший набір туристично-релевантних компонентів: Galleria, DataView, Calendar, Rating |
| JWT у localStorage (не cookie) | Простіша реалізація для SPA; для продакшну розглянути HttpOnly cookie |
| Flyway (не Liquibase) | Простіший синтаксис SQL-міграцій; достатньо для даного масштабу |
| Monorepo | Спрощує розробку та налагодження; єдиний CI/CD пайплайн |
| Tailwind 4 CLI (не PostCSS) | Angular esbuild не передає глобальні CSS через PostCSS pipeline → Tailwind CLI генерує `tailwind-out.css` |
| `--legacy-peer-deps` | PrimeNG 21 вимагає Angular 21, але встановлено Angular 22 — конфлікт peer deps |
| `npm install --legacy-peer-deps` | Обов'язковий прапор для всіх пакетів; без нього npm відмовляє через peer dependency conflicts |

---

*Останнє оновлення: аудит готовності сторінок (2026-06-26)*  
