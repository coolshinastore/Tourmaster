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
| Фреймворк | Angular 18 |
| Мова | TypeScript 5.x |
| Стиль компонентів | Standalone Components (без NgModules) |
| UI-бібліотека | PrimeNG 17.x |
| Стилі | Tailwind CSS (кастомні утиліти поверх PrimeNG-теми) |
| Управління станом | Angular Signals + `CartService` (кошик бронювань) |
| HTTP | `HttpClient` з перехоплювачами (interceptors) для JWT |
| Маршрутизація | Angular Router із lazy loading |
| Форми | Reactive Forms |
| Зображення | `ng-lazyload-image` |
| PrimeNG компоненти | Carousel, DataView, Dialog, Toast, Rating, Galleria, Calendar, Paginator |
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
| `POST` | `/api/bookings` | CLIENT | Створити бронювання |
| `GET` | `/api/bookings/my` | CLIENT | Мої бронювання |
| `GET` | `/api/bookings/{id}/pdf` | CLIENT | Завантажити PDF |
| `POST` | `/api/reviews` | CLIENT | Залишити відгук |
| `GET` | `/api/admin/tours` | MANAGER | Список турів (адмін) |
| `POST` | `/api/admin/tours` | MANAGER | Створити тур |
| `PUT` | `/api/admin/tours/{id}` | MANAGER | Редагувати тур |
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
# Backend
cd backend
mvn spring-boot:run

# Frontend
cd frontend
npm install
ng serve

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

- [x] Аналіз ринку та конкурентів
- [x] Структура сторінок (draw.io)
- [x] Пояснювальна записка — Розділ 1 (ТЗ + аналітичний огляд)
- [x] Дизайн-промпт для Claude Design сформовано
- [x] Дизайн системи розроблений (Claude Design) — дизайн-токени, компоненти, макети 10 сторінок
- [ ] Ініціалізація репозиторію (monorepo)
- [ ] Backend: налаштування Spring Boot, Flyway, SecurityConfig
- [ ] Backend: сутності та міграції БД
- [ ] Backend: Auth API (register / login / refresh)
- [ ] Backend: Tours API (CRUD + пошук)
- [ ] Backend: Bookings API + зміна статусів
- [ ] Backend: Admin API (звіти, клієнти)
- [ ] Frontend: ініціалізація Angular 18 + PrimeNG + Tailwind
- [ ] Frontend: core (interceptors, guards, services)
- [ ] Frontend: головна сторінка
- [ ] Frontend: каталог та деталі туру
- [ ] Frontend: wizard бронювання
- [ ] Frontend: особистий кабінет
- [ ] Frontend: адмін-панель
- [ ] Інтеграційне тестування
- [ ] Розгортання (Docker + Nginx)

---

## 11. Важливі рішення та обґрунтування

| Рішення | Обґрунтування |
|---|---|
| Angular Signals (не NgRx) | Простіша модель стану для проєкту такого масштабу; вбудована реактивність без додаткових залежностей |
| Standalone Components | Angular 18 best practice; менше бойлерплейту, кращий tree-shaking |
| PrimeNG (не Angular Material) | Багатший набір туристично-релевантних компонентів: Galleria, DataView, Calendar, Rating |
| JWT у localStorage (не cookie) | Простіша реалізація для SPA; для продакшну розглянути HttpOnly cookie |
| Flyway (не Liquibase) | Простіший синтаксис SQL-міграцій; достатньо для даного масштабу |
| Monorepo | Спрощує розробку та налагодження; єдиний CI/CD пайплайн |
| Tailwind поверх PrimeNG | PrimeNG забезпечує функціональність компонентів, Tailwind — кастомні утиліти для layout та spacing |

---

*Останнє оновлення: сесія проєктування у Claude.ai*  
*Наступний крок: ініціалізувати репозиторій і розпочати розробку backend з `mvn archetype:generate` або Spring Initializr*
