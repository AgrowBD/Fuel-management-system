# Deployment Guide — Fuel Distribution System

---

## How the app works

The app is a **Next.js 16 fullstack web application**:

- **Frontend** — React pages compiled and served by Next.js. Three separate dashboards (Vehicle Owner, Operator, Admin) protected by login.
- **Backend** — API routes inside `app/api/` run as serverless Node.js functions on the same server. They handle auth, fuel eligibility checks, dispensing, and admin operations.
- **Database** — A single **SQLite file** (`prisma/dev.db`) stores all data: users, vehicles, transactions, schedules, rules. Prisma is the ORM that reads/writes it.
- **Auth** — NextAuth.js issues a signed JWT cookie on login. The `proxy.ts` file checks this cookie on every request to protect routes.
- **Request flow**: Browser → Next.js server → API route → Prisma → SQLite file → response back to browser.

### Data storage location
Right now data lives in: `G:\Projects\Fuel-management-system\fuel-app\prisma\dev.db`

This is a plain file you can open with any SQLite viewer (e.g. [DB Browser for SQLite](https://sqlitebrowser.org/)). For production you would use PostgreSQL instead (change one line in `prisma/schema.prisma`).

---

## Option 1 — VPS (recommended)

A VPS (e.g. DigitalOcean, Hetzner, Contabo) gives you a full Linux server. Next.js runs natively here.

### Requirements
- Ubuntu 22.04 VPS (1 GB RAM minimum)
- Node.js 20+ installed
- A domain name pointing to your server IP (or use the IP directly)

### Step-by-step

**1. Install Node.js on the server**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should be v20+
```

**2. Install PM2 (keeps the app running after you close the terminal)**
```bash
sudo npm install -g pm2
```

**3. Copy your project to the server**

From your Windows machine, zip the project (exclude `node_modules` and `.next`):
```bash
# On Windows — zip the fuel-app folder without node_modules
# Then upload via FileZilla, WinSCP, or scp:
scp fuel-app.zip root@YOUR_SERVER_IP:/var/www/
```

Or use Git (recommended):
```bash
# On server
sudo mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git fuel-app
cd fuel-app
```

**4. Set up environment variables**
```bash
cd /var/www/fuel-app
cp .env .env.production.local
nano .env.production.local
```

Change these values:
```
DATABASE_URL="file:/var/www/fuel-app/prisma/prod.db"
NEXTAUTH_SECRET="generate-a-strong-random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

**5. Install dependencies, run migrations, seed, build**
```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
```

**6. Start with PM2**
```bash
pm2 start npm --name "fuel-app" -- start
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

**7. Set up Nginx as reverse proxy (so port 80/443 forwards to your app on port 3000)**
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/fuel-app
```

Paste this (replace `yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fuel-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**8. Add HTTPS with Let's Encrypt (free SSL)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Your app is now live at `https://yourdomain.com`.

**Useful PM2 commands:**
```bash
pm2 logs fuel-app      # view live logs
pm2 restart fuel-app   # restart after code changes
pm2 status             # check if running
```

---

## Option 2 — Shared Hosting

> ⚠ **Most shared hosting plans do NOT support Next.js** because they only serve static files (HTML/CSS/JS) via Apache or Nginx, and cannot run a Node.js server process.

### What you need to check first

Ask your hosting provider (or check the control panel) if they support:
- **Node.js applications** (not just PHP)
- SSH access
- The ability to run `npm` and keep a process running

Providers that typically work: **cPanel hosts with Node.js Selector** (Namecheap, A2 Hosting, Hostinger Business plan).

Providers that do NOT work: Basic shared hosting, 000webhost, InfinityFree, standard Hostgator/Bluehost shared plans.

### Steps if your host supports Node.js (cPanel + Node.js Selector)

**1.** Upload your project files via File Manager or FTP (exclude `node_modules` and `.next`)

**2.** In cPanel → **Node.js Selector**:
   - Click "Create Application"
   - Node.js version: **20.x**
   - Application root: `public_html/fuel-app` (wherever you uploaded)
   - Application startup file: `server.js` (see below)
   - Click Save

**3.** Create a `server.js` in your project root:
```js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(process.env.PORT || 3000, () => {
    console.log('Server running')
  })
})
```

**4.** In the Node.js Selector terminal, run:
```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
```

**5.** Set environment variables in cPanel Node.js Selector:
```
DATABASE_URL = file:./prisma/prod.db
NEXTAUTH_SECRET = your-strong-secret
NEXTAUTH_URL = https://yourdomain.com
```

**6.** Restart the application from Node.js Selector.

### Alternative: Deploy to Vercel (easiest, free tier available)

Vercel is made by the creators of Next.js and is the simplest deployment option:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables:
   - `NEXTAUTH_SECRET` = your secret
   - `NEXTAUTH_URL` = your Vercel URL
   - `DATABASE_URL` = switch to a hosted Postgres (e.g. Neon.tech free tier — change `prisma/schema.prisma` provider to `postgresql`)
4. Click Deploy

> SQLite does not work on Vercel because the filesystem is read-only. You must switch to PostgreSQL for Vercel/cloud deployments. This requires changing one line in `prisma/schema.prisma` and running a migration.

---

## Switching from SQLite to PostgreSQL (for production)

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   # change from "sqlite"
  url      = env("DATABASE_URL")
}

# Also add back the enum types (SQLite doesn't support them, PostgreSQL does)
```

Set `DATABASE_URL` in your `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fuel_management"
```

Free PostgreSQL options:
- [Neon.tech](https://neon.tech) — free serverless Postgres
- [Supabase](https://supabase.com) — free tier with 500MB
- Your VPS — `sudo apt install postgresql`

Then run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Summary

| Option | Difficulty | Cost | SQLite works? |
|---|---|---|---|
| VPS (Ubuntu + PM2 + Nginx) | Medium | ~$5–10/month | Yes |
| Shared hosting (cPanel + Node.js) | Medium | ~$3–8/month | Yes (if filesystem writable) |
| Vercel | Easy | Free tier | No — needs PostgreSQL |
| Local (current) | None | Free | Yes |
