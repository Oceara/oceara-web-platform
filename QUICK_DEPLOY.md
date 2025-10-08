# Quick Deploy Guide - GitHub & Vercel

## 🚀 Deploy in 5 Minutes

### Prerequisites
- GitHub account
- Vercel account (free tier is fine)
- Git installed on your computer

---

## Step 1: Push to GitHub (2 minutes)

### Option A: Using the Deployment Script (Recommended)

**Windows:**
```bash
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option B: Manual Deployment

```bash
# 1. Initialize Git (if not already)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Oceara Web Platform"

# 4. Add remote (replace with your URL)
git remote add origin https://github.com/Oceara/oceara-web-platform.git

# 5. Push
git push -u origin main
```

---

## Step 2: Deploy to Vercel (3 minutes)

### Option A: Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. **Import** your GitHub repository
4. **Configure:**
   - Framework Preset: **Next.js**
   - Root Directory: **`frontend`** ⚠️ IMPORTANT
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXTAUTH_URL=https://your-vercel-url.vercel.app
   NEXTAUTH_SECRET=generate-a-random-secret
   ```
6. Click **"Deploy"**
7. Wait 2-3 minutes ⏱️
8. Done! 🎉

### Option B: Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd frontend
vercel

# 4. Follow prompts:
# - Link to existing project? No
# - Project name? oceara-web-platform
# - Directory? ./
# - Deploy? Yes

# 5. Deploy to production
vercel --prod
```

---

## Step 3: Deploy Backend (5 minutes)

Your backend needs to be deployed separately. Choose one:

### Option A: Railway (Recommended - Free tier)

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Click **"Add variables"** and add:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-uri
   REDIS_URL=your-redis-url
   JWT_SECRET=your-jwt-secret
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
6. Railway will auto-deploy
7. Copy your Railway URL
8. Update Vercel environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
   ```
9. Redeploy on Vercel

### Option B: Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - Name: `oceara-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Click **"Create Web Service"**

---

## 🎯 Verification Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Railway/Render URL
- [ ] Can sign in with Google OAuth
- [ ] Globe displays correctly
- [ ] API calls work
- [ ] No console errors

---

## 🔧 Common Issues & Fixes

### Issue: "Module not found" errors

**Fix:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Three.js not loading

**Fix:** Add to `next.config.js`:
```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
  }
  return config;
}
```

### Issue: Environment variables not working

**Fix:**
1. Ensure variables start with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding variables
3. Check variable names (case-sensitive)

### Issue: API CORS errors

**Fix:** Update backend CORS:
```typescript
app.use(cors({
  origin: 'https://your-vercel-url.vercel.app',
  credentials: true
}));
```

---

## 📝 Environment Variables Reference

### Frontend (Vercel)

**Required:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXTAUTH_URL=https://your-vercel-url.vercel.app
NEXTAUTH_SECRET=your-random-secret-min-32-chars
```

**Optional:**
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

### Backend (Railway/Render)

**Required:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/oceara
REDIS_URL=redis://default:pass@host:port
JWT_SECRET=your-jwt-secret-min-32-chars
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**Optional:**
```env
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Redis Cloud**: https://redis.com/try-free
- **GitHub Repo**: https://github.com/Oceara/oceara-web-platform
- **Mobile App**: https://github.com/Oceara/Oceara-blue-carbon-mrv

---

## 📞 Need Help?

- **Deployment Guide**: [GITHUB_VERCEL_DEPLOYMENT.md](./GITHUB_VERCEL_DEPLOYMENT.md)
- **Full Documentation**: [README.md](./README.md)
- **Security Guide**: [SECURITY_DEPLOYMENT_GUIDE.md](./SECURITY_DEPLOYMENT_GUIDE.md)

---

## 🎉 You're Done!

Your Oceara Web Platform is now live! 🌊

**Next Steps:**
1. Test all features
2. Set up custom domain (optional)
3. Configure monitoring
4. Share with users!

**Production URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.railway.app`
- API Docs: `https://your-project.railway.app/api-docs`
