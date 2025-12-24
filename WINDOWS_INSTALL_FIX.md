# Installing on Windows

## Quick Solution - Frontend Only

If you're just deploying the **frontend to Vercel**, you don't need backend dependencies:

```bash
# Delete node_modules and lock file
rmdir /s /q node_modules
del package-lock.json

# Install only required dependencies
npm install --omit=optional
```

This skips `better-sqlite3` and other backend packages that need C++ compilation.

---

## For Full Local Development (Backend + Frontend)

If you want to run the backend locally on Windows, you have two options:

### Option 1: Install Visual Studio Build Tools (Recommended)

1. **Download Visual Studio Build Tools**
   - Go to: https://visualstudio.microsoft.com/downloads/
   - Scroll to "Tools for Visual Studio"
   - Download "Build Tools for Visual Studio 2022"

2. **Install with C++ Workload**
   - Run the installer
   - Check "Desktop development with C++"
   - Click Install (takes ~10-15 minutes)

3. **Restart Terminal**
   ```bash
   # Then try again
   npm install
   ```

### Option 2: Use PostgreSQL Instead of SQLite

SQLite's `better-sqlite3` is problematic on Windows. Use PostgreSQL instead:

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres`

2. **Update Dependencies**
   ```bash
   npm uninstall better-sqlite3
   npm install pg
   ```

3. **Update `server/database/init.js`**
   - Use `pg` instead of `better-sqlite3`
   - See DEPLOYMENT.md for PostgreSQL migration guide

---

## Recommended: Deploy Backend to Railway

**Easiest solution for Windows users:**

Don't run the backend locally at all! Deploy it to Railway (Linux):

1. **Deploy Backend to Railway**
   ```
   - Go to railway.app
   - Deploy from GitHub
   - Railway handles all the build tools
   - No Windows issues!
   ```

2. **Run Frontend Locally**
   ```bash
   # Install only frontend deps
   npm install --omit=optional

   # Update API URL in src/utils/api.js
   # Point to your Railway backend

   # Run frontend
   npm run dev
   ```

This way:
- ✅ No C++ build tools needed
- ✅ Backend runs on Linux (Railway)
- ✅ Frontend runs locally on Windows
- ✅ Everything works!

---

## What I Changed

I moved backend dependencies to `optionalDependencies` in `package.json`:

**Before:**
```json
"dependencies": {
  "react": "...",
  "better-sqlite3": "...",  // ← Causes issues on Windows
  "express": "...",
  // all backend stuff mixed in
}
```

**After:**
```json
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.2"
},
"optionalDependencies": {
  "better-sqlite3": "...",  // ← Now optional
  "express": "...",
  // all backend stuff here
}
```

Now you can:
- `npm install --omit=optional` → Frontend only (no build tools needed)
- `npm install` → Everything (requires build tools)

---

## Quick Commands

```bash
# Frontend only (for Vercel deployment)
npm install --omit=optional
npm run dev

# Full stack (requires Visual Studio Build Tools)
npm install
npm run dev:full

# Backend only (after installing build tools)
npm run server
```

---

## Node Version Warning

I also changed `"node": "24.x"` to `"node": "18.x"` because:
- Node 24 is very new and has compatibility issues
- Node 18 LTS is stable and recommended
- Vercel uses Node 18 by default

---

## Summary

**For You Right Now:**

```bash
# 1. Clean install
rmdir /s /q node_modules
del package-lock.json

# 2. Install frontend only
npm install --omit=optional

# 3. Run frontend
npm run dev
```

**For Production:**
- Frontend → Vercel (already configured)
- Backend → Railway (no Windows issues)

**Your frontend will run fine without the backend dependencies!**

Let me commit these changes:
