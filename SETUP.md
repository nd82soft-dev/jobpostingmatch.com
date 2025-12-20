# Setup Guide - ResumePro AI

Complete step-by-step guide to get ResumePro AI running on your local machine or deploy to production.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Configuration](#configuration)
3. [Database Setup](#database-setup)
4. [API Keys](#api-keys)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **RAM**: 2GB minimum
- **Storage**: 500MB for dependencies

### Step 1: Install Node.js

**macOS (using Homebrew)**
```bash
brew install node
```

**Ubuntu/Debian**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows**
- Download from [nodejs.org](https://nodejs.org/)
- Run the installer
- Verify: `node --version` and `npm --version`

### Step 2: Clone Repository
```bash
git clone <your-repository-url>
cd resumepro-ai
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- React & Vite (frontend)
- Express & middleware (backend)
- Database drivers
- AI/ML libraries
- Document processing tools

---

## Configuration

### Environment Variables

1. **Copy the example env file**
```bash
cp .env.example .env
```

2. **Edit .env with your settings**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=generate-a-random-32-char-string-here

# AI API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Database
DATABASE_PATH=./data/resumepro.db

# Frontend
FRONTEND_URL=http://localhost:5173

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating JWT Secret

**Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL**
```bash
openssl rand -hex 32
```

---

## Database Setup

### SQLite (Default - Easiest)

No configuration needed! The database will be created automatically on first run:
```
/data/resumepro.db
```

### PostgreSQL (Production Recommended)

**1. Install PostgreSQL**
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
```

**2. Create database and user**
```sql
CREATE DATABASE resumepro;
CREATE USER resumepro_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE resumepro TO resumepro_user;
```

**3. Update code** in `server/database/init.js`:
```javascript
// Replace better-sqlite3 with pg
import pg from 'pg';
const { Pool } = pg;

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'resumepro',
  user: process.env.DB_USER || 'resumepro_user',
  password: process.env.DB_PASSWORD
});
```

**4. Add to .env**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resumepro
DB_USER=resumepro_user
DB_PASSWORD=your_secure_password
```

---

## API Keys

### Anthropic Claude API

1. **Sign up** at [console.anthropic.com](https://console.anthropic.com/)
2. **Create an API key**
3. **Add to .env**:
```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

**Pricing** (as of 2024):
- Claude Sonnet: ~$3 per million input tokens
- For this app: ~$0.02-0.05 per resume analysis
- Free tier: $5 credit to start

### Alternative: Use OpenAI instead

If you prefer OpenAI, modify `server/services/ai-analyzer.js`:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeResumeMatch(...) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  // ... rest of code
}
```

---

## Running the Application

### Development Mode (Recommended)

**Run both frontend and backend together:**
```bash
npm run dev
```

This starts:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173` (auto-opens in browser)

### Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### Production Build

```bash
# Build frontend
npm run build

# Start server (serves built frontend)
npm start
```

### Verify It's Working

1. **Open browser**: `http://localhost:5173`
2. **Register an account**
3. **Upload a test resume** (create a simple .txt file if needed)
4. **Add a test job posting**
5. **Run analysis**

---

## Production Deployment

### Option 1: Railway (Easiest)

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub repo**
3. **Add environment variables** in Railway dashboard
4. **Deploy** - Railway auto-detects Node.js

**Config:**
- Start command: `npm start`
- Build command: `npm run build`
- Port: Railway auto-assigns

### Option 2: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create resumepro-ai

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set ANTHROPIC_API_KEY=your-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open
heroku open
```

### Option 3: AWS / DigitalOcean

**Backend (EC2/Droplet):**
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <repo-url>
cd resumepro-ai

# Install dependencies
npm install

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name resumepro
pm2 save
pm2 startup
```

**Frontend (S3 + CloudFront):**
```bash
# Build
npm run build

# Upload dist/ to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront for React Router
```

### Database Persistence

**Important**: SQLite files can be lost on some platforms (Heroku, Railway free tier)

**Solutions:**
1. Upgrade to PostgreSQL (recommended)
2. Use Railway's persistent volumes
3. Use managed database (AWS RDS, DigitalOcean Managed DB)

---

## Troubleshooting

### Common Issues

**1. "Cannot find module 'mammoth'"**
```bash
npm install
```

**2. "Port 3001 already in use"**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env
PORT=3002
```

**3. "CORS error"**
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check server/index.js CORS configuration

**4. "Anthropic API error 401"**
- Verify API key is correct
- Check you have credits
- Ensure no extra spaces in .env

**5. "Database locked" (SQLite)**
- Close other connections to DB
- Restart server
- Consider upgrading to PostgreSQL

**6. File uploads not working**
- Check `UPLOAD_DIR` exists and has write permissions:
```bash
mkdir -p uploads
chmod 755 uploads
```

**7. Frontend not connecting to backend**
- Verify backend is running on port 3001
- Check vite.config.js proxy settings
- Clear browser cache

### Debug Mode

**Enable detailed logging:**
```env
NODE_ENV=development
DEBUG=*
```

**Check backend is running:**
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Check database:**
```bash
sqlite3 data/resumepro.db ".tables"
# Should show: users, resumes, jobs, analyses, exports
```

### Performance Issues

**Slow analysis?**
- Claude API can take 5-15 seconds
- This is normal for AI processing
- Consider adding loading indicators

**Large files?**
- Increase `MAX_FILE_SIZE` in .env
- Optimize PDF parsing (use lighter library)

---

## Next Steps

✅ Application is running!

**What to do next:**
1. Test all features thoroughly
2. Customize templates and styling
3. Set up payment integration (Stripe)
4. Add analytics (Google Analytics, Mixpanel)
5. Set up email notifications (SendGrid, Mailgun)
6. Add SEO meta tags
7. Create landing page
8. Deploy to production
9. Market to users!

---

## Support

**Issues?**
- Check [troubleshooting section](#troubleshooting)
- Review logs: Check terminal output
- Open GitHub issue with:
  - Error message
  - Steps to reproduce
  - Environment (OS, Node version)

**Want to contribute?**
- Fork the repo
- Create a feature branch
- Submit a pull request

---

**Happy coding! 🚀**
