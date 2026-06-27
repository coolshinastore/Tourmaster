#!/bin/bash
# ── TourMaster deploy / update script ────────────────────────────────
# Usage:
#   bash deploy.sh          — deploy without SSL (HTTP only)
#   bash deploy.sh --ssl    — deploy with HTTPS (requires certbot-init.sh first)

set -euo pipefail

APP_DIR="/opt/tourmaster"
USE_SSL=false
[[ "${1:-}" == "--ssl" ]] && USE_SSL=true

cd "$APP_DIR"

# ── Validate .env ─────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy and fill .env.example first:"
  echo "  cp .env.example .env && nano .env"
  exit 1
fi

source .env

if [[ "${JWT_SECRET:-replace_with_256bit_random_hex}" == "replace_with_256bit_random_hex" ]]; then
  echo "ERROR: Set a real JWT_SECRET in .env"
  echo "  Generate one with: openssl rand -hex 32"
  exit 1
fi

if [[ "${DB_PASSWORD:-changeme_strong_password}" == "changeme_strong_password" ]]; then
  echo "ERROR: Set a real DB_PASSWORD in .env"
  exit 1
fi

# ── Pull latest code ──────────────────────────────────────────────────
echo "==> Pulling latest changes..."
git pull --ff-only

# ── Choose compose config ─────────────────────────────────────────────
COMPOSE_FILES="-f docker-compose.yml"
if $USE_SSL; then
  if [ ! -f docker-compose.ssl.yml ]; then
    echo "ERROR: docker-compose.ssl.yml not found"
    exit 1
  fi
  COMPOSE_FILES+=" -f docker-compose.ssl.yml"
  echo "==> SSL mode: using nginx-ssl.conf"
fi

# ── Build & start ─────────────────────────────────────────────────────
echo "==> Building images..."
docker compose $COMPOSE_FILES build --no-cache backend frontend

echo "==> Starting services..."
docker compose $COMPOSE_FILES up -d --remove-orphans

# ── Health check ──────────────────────────────────────────────────────
echo "==> Waiting for backend to be healthy..."
for i in $(seq 1 30); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' tourmaster-backend 2>/dev/null || echo "starting")
  echo "    [${i}/30] backend: ${STATUS}"
  [ "$STATUS" = "healthy" ] && break
  [ "$i" -eq 30 ] && echo "WARNING: backend did not become healthy in time" && break
  sleep 5
done

echo ""
echo "==> Service status:"
docker compose $COMPOSE_FILES ps

echo ""
if $USE_SSL; then
  echo "✅  TourMaster deployed → https://${APP_DOMAIN:-yourdomain.com}"
else
  echo "✅  TourMaster deployed → http://$(curl -4 -s ifconfig.me 2>/dev/null || echo '<server-ip>')"
fi
