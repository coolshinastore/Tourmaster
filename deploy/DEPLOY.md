# TourMaster — Деплой на Kamatera VPS

## Вимоги до сервера

- Ubuntu Server 22.04 LTS
- Мінімум 2 vCPU / 2 GB RAM / 20 GB SSD
- Публічний IP-адрес
- Домен, що вказує A-записом на IP сервера (для HTTPS)

---

## Крок 1 — Налаштування сервера (один раз)

Підключитись по SSH і виконати:

```bash
curl -fsSL https://raw.githubusercontent.com/<user>/tourmaster/main/deploy/setup-server.sh | bash
```

Або вручну:

```bash
git clone <url-репозиторію> /opt/tourmaster
bash /opt/tourmaster/deploy/setup-server.sh
```

Встановлює: Docker, Docker Compose, certbot, UFW (22/80/443).

---

## Крок 2 — Клонування репозиторію

```bash
git clone <url-репозиторію> /opt/tourmaster
cd /opt/tourmaster
```

---

## Крок 3 — Заповнення `.env`

```bash
cp .env.example .env
nano .env
```

| Змінна | Що заповнити |
|---|---|
| `DB_PASSWORD` | Надійний пароль (мін. 20 символів) |
| `JWT_SECRET` | 32-байтний hex: `openssl rand -hex 32` |
| `MAIL_USERNAME` | Gmail-адреса для надсилання листів |
| `MAIL_PASSWORD` | App Password з налаштувань Google |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `APP_DOMAIN` | `yourdomain.com` |

---

## Крок 4 — SSL-сертифікат (Let's Encrypt)

> Домен повинен вже вказувати A-записом на IP сервера.

```bash
bash /opt/tourmaster/deploy/certbot-init.sh yourdomain.com admin@yourdomain.com
```

Скрипт:
- Отримує сертифікат через certbot standalone
- Замінює `YOUR_DOMAIN` у `nginx-ssl.conf`
- Оновлює `FRONTEND_URL` і `APP_DOMAIN` у `.env`
- Додає cron для авторенову сертифіката (0 3,15 * * *)

---

## Крок 5 — Запуск застосунку

**З HTTPS (рекомендовано):**
```bash
bash /opt/tourmaster/deploy/deploy.sh --ssl
```

**Без домену (HTTP + IP, для тестування):**
```bash
bash /opt/tourmaster/deploy/deploy.sh
```

Скрипт:
1. Валідує `.env` (перевіряє JWT_SECRET, DB_PASSWORD)
2. Білдить Docker-образи backend і frontend
3. Піднімає всі сервіси (`docker compose up -d`)
4. Чекає поки backend пройде health check
5. Виводить URL застосунку

---

## Крок 6 — Автоматичне резервне копіювання

```bash
(crontab -l 2>/dev/null; echo "0 2 * * * bash /opt/tourmaster/deploy/backup.sh >> /var/log/tourmaster-backup.log 2>&1") | crontab -
```

Бекапи зберігаються у `/opt/tourmaster/backups/`, ротація 14 днів.

---

## Оновлення застосунку

```bash
cd /opt/tourmaster
bash deploy/deploy.sh --ssl   # або без --ssl
```

---

## Корисні команди

```bash
# Логи всіх сервісів
docker compose logs -f

# Логи тільки бекенду
docker compose logs -f backend

# Статус сервісів
docker compose ps

# Перезапуск окремого сервісу
docker compose restart backend

# Зупинити все
docker compose down

# Підключитись до БД
docker exec -it tourmaster-db psql -U tourmaster_user -d tourmaster

# Відновити бекап
gunzip -c backups/tourmaster-20250627_020000.sql.gz | \
  docker exec -i tourmaster-db psql -U tourmaster_user -d tourmaster
```

---

## Структура Docker-сервісів

```
nginx (80/443) ──► frontend (Angular, :80)
               ──► backend  (Spring Boot, :8080)
                              └──► db (PostgreSQL, :5432)
```

Файли конфігурації nginx:
- `nginx.conf` — HTTP (локальна розробка / без SSL)
- `nginx-ssl.conf` — HTTPS (продакшн, заповнюється `certbot-init.sh`)

---

## Акаунти за замовчуванням (DataSeeder — тільки dev)

> У продакшні DataSeeder відключено (`SPRING_PROFILES_ACTIVE=prod`).

| Роль | Email | Пароль |
|---|---|---|
| Менеджер | manager@tourmaster.ua | Manager@2025 |
| Клієнт 1 | client1@example.com | Client@2025 |
| Клієнт 2 | client2@example.com | Client@2025 |
