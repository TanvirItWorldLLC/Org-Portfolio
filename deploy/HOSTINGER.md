# Hostinger KVM VPS — Production Deployment Guide

> **Target:** Ubuntu 22.04 or 24.04 LTS on Hostinger KVM 1 (≥4 GB RAM recommended for Three.js workload).
> **App stack:** Next.js 14 (single App Router) + Prisma + MySQL 8 + PM2 + Nginx + Let's Encrypt.

This guide assumes a fresh VPS accessible over SSH as `root`.

---

## 1. Server prep (as root)

```bash
apt update && apt upgrade -y

# Create non-root deploy user
adduser portfolio --disabled-password --gecos ""
usermod -aG sudo portfolio
echo "portfolio ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/portfolio
mkdir -p /home/portfolio/.ssh && chmod 700 /home/portfolio/.ssh
cp ~/.ssh/authorized_keys /home/portfolio/.ssh/   # optional: reuse root key
chown -R portfolio:portfolio /home/portfolio/.ssh

# Firewall (UFW)
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2Ban
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 2. Node.js 20 + PM2 (as `portfolio`)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # v20.x

sudo npm install -g pm2
pm2 --version
```

Log out, log back in as `portfolio` so PM2's systemd integration works.

---

## 3. MySQL 8 (as root)

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
# Choose: validate password plugin = No, set root password, remove anonymous users, disallow remote root, remove test DB, reload.

sudo mysql
```

In the mysql shell:

```sql
CREATE DATABASE org_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'org_user'@'localhost' IDENTIFIED BY 'GENERATE-A-STRONG-PASSWORD';
GRANT ALL PRIVILEGES ON org_portfolio.* TO 'org_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Save the password for step 6.

---

## 4. Nginx + Certbot (as root)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
```

Place the app config from `deploy/nginx/portfolio.conf`, replacing `yourdomain.com` and `admin@yourdomain.com` (Certbot needs the latter for renewal emails).

```bash
sudo cp /home/portfolio/app/deploy/nginx/portfolio.conf /etc/nginx/sites-available/portfolio.conf
sudo sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/portfolio.conf
sudo ln -s /etc/nginx/sites-available/portfolio.conf /etc/nginx/sites-enabled/portfolio.conf
sudo nginx -t
sudo systemctl reload nginx
```

Before issuing SSL, make sure DNS A records for `yourdomain.com` and (optionally) `www.yourdomain.com` point to the VPS IP.

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com \
  --agree-tos -n -m admin@yourdomain.com
```

Certbot auto-renews via a systemd timer; verify:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

---

## 5. App deployment (as `portfolio`)

```bash
# Clone from your Git repo (use HTTPS + PAT, or set up SSH deploy key)
cd ~
git clone https://github.com/TanvirItWorldLLC/Org-Portfolio.git app
cd app

# Or, if uploading manually:
#   On local machine:  rsync -avz --exclude node_modules --exclude .next ./org-portfolio/ portfolio@YOUR_IP:/home/portfolio/app/

# Install dependencies (production only, plus Prisma)
npm ci

# Configure environment
cp .env.example .env
nano .env   # ← set DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_SITE_URL, ADMIN_*
```

Generate a JWT secret:

```bash
openssl rand -base64 48
```

Sample `.env`:

```
NODE_ENV=production
DATABASE_URL="mysql://org_user:YOUR_STRONG_PASSWORD@127.0.0.1:3306/org_portfolio"
JWT_SECRET="<paste output of openssl rand -base64 48>"
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="Org Portfolio"
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD='ChangeThisAfterFirstLogin!2024'
ADMIN_NAME="Admin User"
```

```bash
# Apply schema and seed
npm run db:push
npm run db:seed

# Build
npm run build

# Start with PM2 (cluster mode, 2 workers — adjust to your CPU count)
pm2 start npm --name org-portfolio -- start --instances 2 --max-memory-restart 500M
pm2 save

# Enable PM2 systemd startup (run as root)
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u portfolio --hp /home/portfolio
sudo systemctl enable pm2-portfolio
```

The `pm2 startup` command prints the exact systemd unit to install — follow that.

---

## 6. Daily backups

```bash
mkdir -p /home/portfolio/backups
chmod 700 /home/portfolio/backups
cp /home/portfolio/app/deploy/scripts/backup.sh /home/portfolio/backup.sh
chmod +x /home/portfolio/backup.sh

# Run daily at 03:30
(crontab -l 2>/dev/null; echo "30 3 * * * /home/portfolio/backup.sh >> /home/portfolio/backups/backup.log 2>&1") | crontab -
```

Backups are kept for 14 days (oldest are deleted automatically). Test:

```bash
/home/portfolio/backup.sh
ls -lh /home/portfolio/backups/
```

---

## 7. Log rotation

`pm2-logrotate` keeps PM2 logs from filling the disk:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

---

## 8. Health check

```bash
curl -fsSL https://yourdomain.com/api/health
```

Should return:

```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "counts": { "users": 1, "projects": 3, "orders": 0 }
}
```

`deploy/scripts/verify.sh` automates end-to-end checks (HTTP 200 on `/`, `/api/health`, `/login`; admin login smoke test). Run from your laptop after deploy.

---

## 9. Rollback

If a deploy breaks production:

```bash
# 1. Stop the app
pm2 stop org-portfolio

# 2. Roll back code
cd /home/portfolio/app
git log --oneline -5    # find the last good commit
git checkout <commit-sha>
npm ci && npm run build

# 3. Restart
pm2 start org-portfolio
pm2 save

# 4. If the database migration is bad:
cd /home/portfolio/app
npm run db:deploy   # applies pending migrations
# Or restore from backup:
gunzip -c /home/portfolio/backups/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u org_user -p org_portfolio
```

`deploy/scripts/rollback.sh` automates the above.

---

## 10. Post-deploy checklist

- [ ] `https://yourdomain.com/` returns the 3D hero
- [ ] `https://yourdomain.com/login` loads; admin login works
- [ ] `https://yourdomain.com/admin/dashboard` accessible
- [ ] Submit a test order via `/order` → visible in `/admin/orders`
- [ ] PM2 shows 0 restarts: `pm2 list`
- [ ] Certbot auto-renewal works: `sudo certbot renew --dry-run`
- [ ] Firewall rules: `sudo ufw status`
- [ ] Fail2Ban active: `sudo fail2ban-client status sshd`
- [ ] Backup runs: `ls -lh /home/portfolio/backups/`
- [ ] Security headers (HSTS, X-Frame-Options, etc.) verified via `curl -I https://yourdomain.com`

---

## Troubleshooting

**App boots but DB queries fail with `Can't connect`**
- Confirm `DATABASE_URL` uses `127.0.0.1`, not `localhost` (DNS resolver difference)
- `sudo systemctl status mysql`
- `mysql -u org_user -p org_portfolio`

**Prisma client missing in production**
- The `postinstall` script regenerates the client. If you ran `npm ci --omit=dev`, that's fine — Prisma engine files are still copied.

**3D scene not rendering**
- Ensure the user's browser supports WebGL (most do). On mobile, low-end GPUs may struggle with `count={800}` particles — tune in `components/three/HomeSceneContent.tsx`.

**Certbot renewal fails behind Cloudflare proxy**
- If using Cloudflare, set DNS records to "DNS only" (grey cloud) before issuing certs, or use the DNS-01 challenge with a Cloudflare API token.

**Out of disk**
- `pm2 flush` clears PM2 logs
- `du -sh /home/portfolio/backups/* | sort -h` — reduce retention in `backup.sh`