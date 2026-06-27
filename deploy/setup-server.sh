#!/bin/bash
# ── TourMaster: one-time server setup for Kamatera VPS (Ubuntu 22.04) ──
# Run as root: bash setup-server.sh

set -euo pipefail

echo "==> Updating system..."
apt-get update -q && apt-get upgrade -y -q

echo "==> Installing dependencies..."
apt-get install -y -q \
  ca-certificates curl gnupg lsb-release \
  git ufw certbot cron

# ── Docker ────────────────────────────────────────────────────────────
echo "==> Installing Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -q
apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable --now docker

echo "==> Docker version: $(docker --version)"
echo "==> Docker Compose version: $(docker compose version)"

# ── Firewall ──────────────────────────────────────────────────────────
echo "==> Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
ufw status

# ── App directory ─────────────────────────────────────────────────────
echo "==> Creating /opt/tourmaster..."
mkdir -p /opt/tourmaster
cd /opt/tourmaster

echo ""
echo "✅  Server setup complete."
echo ""
echo "Next steps:"
echo "  1. Clone the repo:  git clone <your-repo-url> /opt/tourmaster"
echo "  2. Copy env file:   cp /opt/tourmaster/.env.example /opt/tourmaster/.env && nano /opt/tourmaster/.env"
echo "  3. Get SSL cert:    bash /opt/tourmaster/deploy/certbot-init.sh yourdomain.com"
echo "  4. Deploy:          bash /opt/tourmaster/deploy/deploy.sh"
