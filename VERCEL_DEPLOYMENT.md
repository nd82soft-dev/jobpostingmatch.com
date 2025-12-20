# Deploying to Vercel - Quick Guide

Vercel is optimized for frontend deployment. For this full-stack app, you have two options:

## Option 1: Split Deployment (Recommended)

Deploy frontend to Vercel, backend to Railway/Render.

### Frontend (Vercel)

1. **Push code to GitHub** ✅ (already done)

2. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `vite build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables** (optional for frontend-only features)
   - No environment variables needed for basic deployment
   - API calls will go to your backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://your-app.vercel.app`

### Backend (Railway)

1. **Go to [railway.app](https://railway.app)**
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Settings**
   - Root Directory: Leave blank (or `server` if you reorganize)
   - Start Command: `node server/index.js`
   - Build Command: `npm install`

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your-random-secret-here
   ANTHROPIC_API_KEY=your-api-key
   FRONTEND_URL=https://your-app.vercel.app
   PORT=3001
   ```

4. **Get Backend URL**
   - Railway provides: `https://your-app.up.railway.app`

5. **Update Frontend API URL**
   - Edit `src/utils/api.js`:
   ```javascript
   const api = axios.create({
     baseURL: 'https://your-app.up.railway.app/api',
     // ... rest
   });
   ```
   - Push changes to GitHub
   - Vercel will auto-redeploy

### Database
- Railway offers PostgreSQL add-on ($5/month)
- Or use Supabase, PlanetScale (free tiers available)

---

## Option 2: Vercel-Only (Serverless Functions)

Convert backend to Vercel Serverless Functions.

**⚠️ Limitations:**
- 10s timeout on Hobby plan
- Stateless functions (no persistent connections)
- Database needs external service
- More complex setup

**Setup:**

1. **Create `api/` directory** in project root

2. **Convert routes to serverless functions**

Each file in `api/` becomes an endpoint:
```
api/auth.js → /api/auth
api/resumes.js → /api/resumes
```

Example `api/auth.js`:
```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    // Your auth logic here
    res.status(200).json({ token: '...' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

3. **Use external database**
   - PostgreSQL: Supabase, Neon, PlanetScale
   - MongoDB: MongoDB Atlas

4. **Update `vercel.json`**:
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

**Not recommended for beginners** - stick with Option 1.

---

## Quick Deploy (Option 1 - Recommended)

### Step-by-Step:

**1. Deploy Backend First (Railway)**
```bash
# Go to railway.app
# Connect GitHub
# Select repo
# Add environment variables (see above)
# Deploy
# Copy the URL (e.g., https://resumepro.up.railway.app)
```

**2. Update Frontend API URL**
Edit `src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://your-railway-app.up.railway.app/api'
    : '/api',
  // ...
});
```

Or create `.env.production`:
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

And use in `src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
});
```

**3. Deploy Frontend (Vercel)**
```bash
# Go to vercel.com
# Import GitHub repository
# Build settings auto-detected
# Deploy
```

**4. Done!**
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.up.railway.app

---

## Environment Variables

### Backend (Railway)
```env
NODE_ENV=production
JWT_SECRET=<generate-random-32-char-string>
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://your-app.vercel.app
DATABASE_URL=<if-using-postgres>
PORT=3001
```

### Frontend (Vercel - optional)
```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

---

## Costs

**Free Tier:**
- Vercel: Free for personal projects
- Railway: $5 credit/month (enough for small apps)

**Paid:**
- Vercel Pro: $20/month (not needed initially)
- Railway: ~$5-10/month for small app
- Database: $0-15/month depending on provider

**Total**: $0-20/month to start

---

## Troubleshooting

**CORS errors:**
- Ensure `FRONTEND_URL` is set correctly in backend
- Check CORS settings in `server/index.js`

**Build fails on Vercel:**
- Check package.json has all dependencies
- Verify `@anthropic-ai/sdk` (not `anthropic-sdk`)
- Check Node version is 18+

**API not connecting:**
- Verify backend URL in frontend code
- Check Railway logs: `railway logs`
- Test backend directly: `curl https://your-backend.up.railway.app/api/health`

**Database errors:**
- If using SQLite, won't work on Railway (ephemeral storage)
- Migrate to PostgreSQL (see DEPLOYMENT.md)

---

## Alternative: Deploy Everything to Railway

**Simpler option:**

1. **Deploy to Railway only**
   - Railway serves both frontend and backend
   - No need to split deployments

2. **Build frontend as part of backend**
   - Modify `package.json`:
   ```json
   "scripts": {
     "build": "vite build",
     "start": "npm run build && node server/index.js"
   }
   ```

3. **Serve frontend from Express**
   - Edit `server/index.js`:
   ```javascript
   import express from 'express';
   import path from 'path';

   const app = express();

   // Serve static files
   app.use(express.static(path.join(__dirname, '../dist')));

   // API routes
   app.use('/api', ...);

   // Catch-all for React Router
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../dist/index.html'));
   });
   ```

**Pros**: Single deployment, easier to manage
**Cons**: Slower build times, all eggs in one basket

---

## Recommended Approach

For **production launch**: **Option 1 (Split Deployment)**
- Frontend on Vercel (free, fast CDN)
- Backend on Railway ($5-10/month)
- Database on Railway PostgreSQL or Supabase

For **quick testing**: **Railway Only**
- Deploy everything to Railway
- Fastest to get running

---

## Next Steps After Deploy

1. ✅ Test all features in production
2. ✅ Add custom domain
3. ✅ Set up SSL (automatic on both platforms)
4. ✅ Configure environment variables
5. ✅ Set up database backups
6. ✅ Add monitoring (Sentry, LogRocket)
7. ✅ Add payment integration (Stripe)

---

**Need help?** Check the main DEPLOYMENT.md for more detailed guides!
