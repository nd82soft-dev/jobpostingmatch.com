# Fixing Vercel 404 Error

## The Problem
Your build succeeds but you're getting 404 Page Not Found when visiting the site.

## Root Cause
Vercel isn't properly serving the Single Page Application (SPA) - all routes need to redirect to `index.html` for React Router to work.

---

## ✅ Solutions (Try in Order)

### Solution 1: Updated Configuration (Already Applied)

I've updated these files:

**1. `vercel.json`** - Complete routing configuration
```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**2. `vite.config.js`** - Explicit build configuration
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});
```

**3. `public/_redirects`** - Fallback for SPA routing
```
/*    /index.html   200
```

**Now commit and push:**
```bash
git add -A
git commit -m "Fix Vercel 404 routing issues"
git push origin claude/resume-job-matcher-Jc1u7
```

Vercel will auto-redeploy and the 404 should be fixed!

---

### Solution 2: Vercel Dashboard Settings

If still getting 404 after the above, manually configure in Vercel:

1. **Go to your Vercel project dashboard**
2. **Settings → Build & Development Settings**
3. Set the following:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. **Settings → Functions → Edge Functions**
   - Not needed for this project

5. **Redeploy**
   - Go to "Deployments"
   - Click the three dots on latest deployment
   - Click "Redeploy"

---

### Solution 3: Check Build Output

In Vercel deployment logs, you should see:

```
✓ built in XXXms
✓ dist/index.html                    XX kB
✓ dist/assets/index-XXXXX.js         XXX kB
✓ dist/assets/index-XXXXX.css        XX kB
```

If you see errors like:
- `index.html not found` → Build failed
- `Cannot resolve module` → Missing dependency

**Fix**: Check the build logs for the specific error.

---

### Solution 4: Manual Build Test

Test if the build works locally:

```bash
# Install dependencies
npm install

# Build
npm run build

# Check dist folder was created
ls -la dist/

# Should show:
# index.html
# assets/
# vite.svg
```

If `dist/` folder is empty or missing, the build failed.

---

### Solution 5: Vercel CLI Deploy

Deploy directly using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts
```

This bypasses GitHub integration and can help diagnose issues.

---

## 🔍 Debugging Steps

### Check What's Being Served

1. **Visit your Vercel URL**
   ```
   https://your-app.vercel.app
   ```

2. **Open Browser DevTools (F12)**
   - Go to Network tab
   - Refresh page
   - Look for:
     - `index.html` - Should return **200**
     - `main.js` or `index-XXXX.js` - Should return **200**
     - If both are **404**, build is broken

3. **Check Console tab**
   - Look for errors like:
     - `Failed to load module`
     - `Unexpected token <` (means HTML returned instead of JS)

### Common Issues

**Issue: "Failed to fetch dynamically imported module"**
```
Solution: Clear browser cache and hard refresh (Ctrl+Shift+R)
```

**Issue: Blank white page (no 404)**
```
Solution: React app loaded but errored. Check browser console.
```

**Issue: 404 on every page**
```
Solution: Routing not configured. Use vercel.json above.
```

**Issue: Homepage works, but /dashboard gives 404**
```
Solution: SPA routing not set up. Use vercel.json rewrites.
```

---

## 🎯 Expected Result After Fix

### Homepage (`/`)
- ✅ Shows login/register form
- ✅ No 404 error
- ✅ React app loads

### Any Route (`/dashboard`, `/upload`, etc.)
- ✅ React Router handles it
- ✅ No 404 from Vercel
- ✅ Shows auth login if not logged in

### Static Assets
- ✅ CSS loads
- ✅ JavaScript bundles load
- ✅ Images load

---

## 🚀 Recommended Deployment Flow

**For Split Deployment (Frontend + Backend):**

### Step 1: Deploy Backend First (Railway)

```bash
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Add environment variables:
   - NODE_ENV=production
   - JWT_SECRET=<random-secret>
   - ANTHROPIC_API_KEY=<your-key>
   - FRONTEND_URL=*  (temporarily allow all origins)
5. Deploy
6. Copy Railway URL: https://your-app.up.railway.app
```

### Step 2: Update Frontend API URL

Edit `src/utils/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://your-railway-app.up.railway.app/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Or** create `.env.production.local`:
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

And update `src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
});
```

### Step 3: Push Changes

```bash
git add -A
git commit -m "Configure production API URL"
git push origin claude/resume-job-matcher-Jc1u7
```

### Step 4: Deploy Frontend (Vercel)

Vercel auto-deploys on push. Wait 2-3 minutes.

### Step 5: Test

1. Visit Vercel URL
2. Should load without 404
3. Try to register/login
4. If API calls fail, check CORS settings in backend

---

## 🔧 Alternative: Deploy Everything to Railway

**Simpler option for testing:**

1. **Deploy to Railway only**
2. **Serve frontend from Express**

Edit `server/index.js`:

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
// ... other API routes

// Catch-all: serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "start": "npm run build && node server/index.js"
  }
}
```

Deploy to Railway - done! One deployment, no CORS issues.

---

## 📊 What to Expect

### After Fix:

✅ **Homepage loads**
✅ **No 404 errors**
✅ **React app initialized**
✅ **Can navigate between pages**
✅ **Static assets load correctly**

### API calls will fail IF:
- Backend not deployed
- CORS not configured
- API URL not set

But the 404 will be gone!

---

## 🆘 Still Getting 404?

**Last resort debugging:**

1. **Check Vercel build logs**
   - Go to Vercel dashboard
   - Click latest deployment
   - View full build logs
   - Look for errors

2. **Check what files were deployed**
   - In Vercel deployment page
   - Click "View Deployment"
   - Add `/index.html` to URL
   - Should show your HTML file

3. **Check source on Vercel**
   - Click "Source" tab in deployment
   - Verify files are correct

4. **Try clean deploy**
   ```bash
   # In Vercel dashboard
   Settings → Git → Disconnect
   Then reconnect and redeploy
   ```

---

## ✅ Quick Checklist

- [ ] Updated `vercel.json` with routing
- [ ] Updated `vite.config.js` with build settings
- [ ] Created `public/_redirects` file
- [ ] Committed and pushed changes
- [ ] Waited for Vercel redeploy (2-3 min)
- [ ] Cleared browser cache
- [ ] Tested homepage loads
- [ ] Tested sub-routes load

If all checked and still 404, review build logs in Vercel dashboard.

---

**Your fix is committed and ready. Push to GitHub and Vercel will auto-deploy!** 🚀
