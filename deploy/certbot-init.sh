#!/bin/bash
# ── Obtain Let's Encrypt certificate ──────────────────────────────────
# Usage: bash certbot-init.sh yourdomain.com [admin@email.com]
# Run BEFORE starting nginx for the first time.

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> [email]}"
EMAIL="${2:-admin@${DOMAIN}}"
APP_DIR="/opt/tourmaster"

echo "==> Obtaining certificate for ${DOMAIN} (email: ${EMAIL})..."

# Stop nginx if running (frees port 80 for standalone challenge)
cd "$APP_DIR"
docker compose stop nginx 2>/dev/null || true

certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN"

echo "==> Certificate obtained: /etc/letsencrypt/live/${DOMAIN}/"

# Patch nginx-ssl.conf with the real domain
sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" "$APP_DIR/nginx-ssl.conf"

# Update .env: set APP_DOMAIN and FRONTEND_URL
sed -i "s|^APP_DOMAIN=.*|APP_DOMAIN=${DOMAIN}|" "$APP_DIR/.env"
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|" "$APP_DIR/.env"

echo "==> Setting up auto-renewal cron (twice daily)..."
(crontab -l 2>/dev/null; echo "0 3,15 * * * certbot renew --quiet --post-hook 'docker compose -f ${APP_DIR}/docker-compose.yml -f ${APP_DIR}/docker-compose.ssl.yml restart nginx'") | crontab -

echo ""
echo "✅  SSL certificate ready."
echo "Now run:  bash ${APP_DIR}/deploy/deploy.sh --ssl"
