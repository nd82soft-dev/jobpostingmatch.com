# Deployment Guide - ResumePro AI

## Quick Deploy Options

### 1. Railway (Recommended - Easiest)
**Time**: ~5 minutes
**Cost**: Free tier available, $5/month for hobby

1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables in Settings:
   - `ANTHROPIC_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Click Deploy

**Automatic:**
- Detects Node.js
- Runs `npm install` and `npm start`
- Provides HTTPS URL
- Postgres add-on available

---

### 2. Vercel (Frontend) + Railway (Backend)
**Best for**: Optimized frontend performance

**Frontend (Vercel):**
```bash
npm run build
vercel --prod
```

**Backend (Railway):**
- Deploy server/ directory to Railway
- Update frontend API calls to Railway URL

---

### 3. Heroku
**Time**: ~10 minutes

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set ANTHROPIC_API_KEY=your-key
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

---

### 4. AWS Full Stack

**Components:**
- **EC2**: Backend server
- **S3 + CloudFront**: Frontend static files
- **RDS**: PostgreSQL database
- **Route 53**: DNS

**Backend (EC2):**
```bash
# Launch EC2 Ubuntu instance
# SSH in and run:

sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

git clone your-repo
cd resumepro-ai
npm install

# Create .env with production values

# Start with PM2
pm2 start server/index.js
pm2 startup
pm2 save

# Setup nginx reverse proxy
sudo apt install nginx
```

**Nginx config** (`/etc/nginx/sites-available/resumepro`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Frontend (S3 + CloudFront):**
```bash
# Build frontend
npm run build

# Create S3 bucket
aws s3 mb s3://resumepro-frontend

# Upload
aws s3 sync dist/ s3://resumepro-frontend --acl public-read

# Create CloudFront distribution pointing to S3
# Enable custom domain with Route 53
```

---

### 5. DigitalOcean App Platform
**Time**: ~5 minutes
**Cost**: $5/month

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Configure:
   - Detect Node.js
   - Build: `npm run build`
   - Run: `npm start`
5. Add environment variables
6. Add PostgreSQL database (optional, $15/month)
7. Deploy

---

## Environment Variables for Production

**Required:**
```env
NODE_ENV=production
JWT_SECRET=<generate-new-random-secret>
ANTHROPIC_API_KEY=<your-api-key>
```

**Database:**
```env
# PostgreSQL (recommended for production)
DATABASE_URL=postgresql://user:password@host:5432/database

# Or individual vars
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=resumepro
DB_USER=resumepro_user
DB_PASSWORD=<secure-password>
```

**CORS:**
```env
FRONTEND_URL=https://your-frontend-domain.com
```

---

## Database Migration (SQLite → PostgreSQL)

**1. Update package.json:**
```json
{
  "dependencies": {
    "pg": "^8.11.3"
  }
}
```

**2. Update server/database/init.js:**
```javascript
import pg from 'pg';
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export { db };

export async function initDatabase() {
  await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      subscription_tier TEXT DEFAULT 'free',
      subscription_expires_at BIGINT,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
      updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
    )
  `);

  // ... rest of tables (update syntax for PostgreSQL)
}
```

**3. Update all SQL queries:**
```javascript
// SQLite
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

// PostgreSQL
const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
const user = result.rows[0];
```

---

## SSL/HTTPS Setup

### Option A: Let's Encrypt (Free)

**Using Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

### Option B: Cloudflare (Free + CDN)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

**Benefits:**
- Free SSL
- CDN (faster loading)
- DDoS protection
- Analytics

---

## Performance Optimization

### 1. Frontend Optimization

**Vite Build Optimizations:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mammoth: ['mammoth'],
        },
      },
    },
  },
});
```

**Lazy Loading:**
```javascript
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Analysis = lazy(() => import('./components/Analysis/Analysis'));
```

### 2. Backend Optimization

**Enable Compression:**
```javascript
import compression from 'compression';
app.use(compression());
```

**Redis Caching (optional):**
```javascript
import redis from 'redis';
const client = redis.createClient();

// Cache analysis results for 24 hours
await client.setex(`analysis:${id}`, 86400, JSON.stringify(result));
```

### 3. Database Optimization

**Indexes:**
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_resume_user ON resumes(user_id);
CREATE INDEX idx_job_user ON jobs(user_id);
CREATE INDEX idx_analysis_resume_job ON analyses(resume_id, job_id);
```

**Connection Pooling:**
```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## Monitoring & Logging

### 1. Application Monitoring

**Sentry (Error Tracking):**
```bash
npm install @sentry/node @sentry/react
```

```javascript
// server/index.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Logging

**Winston:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
```

### 3. Analytics

**Google Analytics:**
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

**Mixpanel (Product Analytics):**
```javascript
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_TOKEN');
mixpanel.track('Resume Analyzed', { score: 85 });
```

---

## Backup & Recovery

### Database Backups

**PostgreSQL (Automated):**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U user resumepro > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://resumepro-backups/

# Add to crontab
0 2 * * * /path/to/backup.sh
```

**Restore:**
```bash
psql -h localhost -U user resumepro < backup_20240101_020000.sql
```

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] File upload validation
- [ ] JWT secrets rotated
- [ ] Dependencies updated (`npm audit fix`)
- [ ] Secrets not in Git
- [ ] Error messages don't leak sensitive info

---

## Cost Estimates

**Small Scale (100 users, 500 analyses/month):**
- Railway/Heroku: $5-10/month
- PostgreSQL: $7-15/month
- Claude API: $10-25/month
- **Total: ~$25-50/month**

**Medium Scale (1000 users, 5000 analyses/month):**
- Server: $25-50/month
- Database: $15-30/month
- Claude API: $100-250/month
- CDN: $5-10/month
- **Total: ~$150-350/month**

**Revenue Break-even:**
- At $9 per export: ~17-40 exports/month
- At $19/month subscription: 8-19 subscribers

---

## Rollback Plan

**If deployment fails:**

1. **Revert Git:**
```bash
git revert HEAD
git push heroku main
```

2. **Database Rollback:**
```bash
psql resumepro < backup_previous.sql
```

3. **Check Logs:**
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# PM2
pm2 logs
```

---

## Post-Deployment Checklist

- [ ] Application loads
- [ ] User can register/login
- [ ] Resume upload works
- [ ] Job posting input works
- [ ] Analysis generates correctly
- [ ] PDF export works (Premium)
- [ ] DOCX export works (Premium)
- [ ] Email notifications send (if enabled)
- [ ] Payment processing works (if enabled)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] SSL certificate valid
- [ ] Database backups scheduled
- [ ] Monitoring/alerts set up

---

**You're live! 🚀**

Next: Marketing, user acquisition, and iteration based on feedback!
