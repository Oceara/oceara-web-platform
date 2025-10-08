# GitHub & Vercel Deployment Guide

## 🚀 Deploying Oceara Web Platform to GitHub & Vercel

This guide covers deploying the **Oceara Web Platform** (Next.js + Express.js full-stack application) to GitHub and Vercel.

**Note**: This is different from the [Oceara Flutter Mobile App](https://github.com/Oceara/Oceara-blue-carbon-mrv) which is for mobile devices.

---

## 📋 Pre-Deployment Checklist

### 1. **Repository Setup**
- [ ] Create new GitHub repository: `Oceara-web-platform` or `oceara-fullstack-web`
- [ ] Ensure `.gitignore` is properly configured
- [ ] Remove sensitive data from code
- [ ] Update environment variables

### 2. **Code Preparation**
- [ ] All tests passing
- [ ] Build successful locally
- [ ] Dependencies up to date
- [ ] Documentation complete

### 3. **Environment Variables**
- [ ] All secrets moved to environment variables
- [ ] `.env` files NOT committed to Git
- [ ] Production environment variables prepared

---

## 🔧 Step 1: Prepare for GitHub

### Update .gitignore

Ensure your `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production builds
build/
dist/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Uploads
uploads/
temp/

# Secrets
*.pem
*.key
google-services.json
GoogleService-Info.plist

# Database
*.db
*.sqlite

# Docker
.dockerignore

# ML Models (large files)
ml-models/models/*.h5
ml-models/models/*.pkl
ml-models/data/

# Blockchain
hardhat/cache/
hardhat/artifacts/
```

### Create Repository README

Create a clear README that differentiates from the mobile app:

```markdown
# Oceara Web Platform 🌊

**Official Web Application for Blue Carbon Ecosystem Management**

> This is the **web platform** for Oceara. For the mobile app, see [Oceara Flutter App](https://github.com/Oceara/Oceara-blue-carbon-mrv).

## 🌐 What is This?

The Oceara Web Platform is a comprehensive full-stack application for:
- **Land Owners**: Register and manage blue carbon restoration projects
- **Buyers**: Browse and purchase verified carbon credits
- **Admins**: Verify projects and manage the platform

## 🏗️ Architecture

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Express.js + MongoDB + Redis
- **Blockchain**: Solidity smart contracts on Polygon
- **AI/ML**: Python + TensorFlow + XGBoost
- **3D Visualization**: Three.js interactive Earth globe

## 🚀 Live Demo

- **Production**: https://oceara.vercel.app
- **Staging**: https://oceara-staging.vercel.app
- **API Docs**: https://oceara.vercel.app/api-docs

## 📱 Mobile App

Looking for the mobile app? Check out the [Oceara Flutter App](https://github.com/Oceara/Oceara-blue-carbon-mrv).

## 🔗 Related Repositories

- [Oceara Mobile App](https://github.com/Oceara/Oceara-blue-carbon-mrv) - Flutter mobile application
- [Oceara Smart Contracts](https://github.com/Oceara/oceara-contracts) - Solidity contracts (if separate)
- [Oceara ML Models](https://github.com/Oceara/oceara-ml) - ML models (if separate)

## 📚 Documentation

- [Complete Documentation](./README.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./GITHUB_VERCEL_DEPLOYMENT.md)
- [Security Guide](./SECURITY_DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE)
```

---

## 🔧 Step 2: Configure for Vercel

### Create vercel.json

Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "name": "oceara-web-platform",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### Update next.config.js for Vercel

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Output standalone for Vercel
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [
      'api.mapbox.com',
      'lh3.googleusercontent.com',
      's3.amazonaws.com',
      'storage.googleapis.com'
    ],
    formats: ['image/avif', 'image/webp']
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle Three.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### Create .vercelignore

Create `.vercelignore` in the root:

```
# Backend (not deployed to Vercel)
backend/

# ML Models
ml-models/

# Smart Contracts
contracts/
hardhat/

# Docker
docker-compose.yml
Dockerfile.*
nginx/

# Monitoring
monitoring/

# CI/CD
.github/

# Documentation (optional)
*.md
!README.md

# Tests
**/*.test.ts
**/*.test.tsx
**/*.spec.ts

# Development
.vscode/
.idea/
```

---

## 🔧 Step 3: Deploy Backend Separately

**Important**: Vercel is primarily for frontend. Deploy your backend to:

### Option 1: Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend directory
4. Add environment variables
5. Deploy

### Option 2: Render

1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Root directory: `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables

### Option 3: Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create oceara-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Deploy
git subtree push --prefix backend heroku main
```

### Option 4: DigitalOcean App Platform

1. Go to DigitalOcean
2. Create new App
3. Connect GitHub repository
4. Select backend directory
5. Configure environment variables
6. Deploy

---

## 🚀 Step 4: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
cd frontend
vercel

# Deploy to production
vercel --prod
```

### Method 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables (see below)
6. Click "Deploy"

---

## 🔐 Step 5: Configure Environment Variables

### Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Google OAuth
NEXTAUTH_URL=https://oceara.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Blockchain (if needed on frontend)
NEXT_PUBLIC_ETHEREUM_RPC_URL=your-rpc-url
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Backend Environment Variables

On your backend hosting platform (Railway/Render/etc.):

```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://oceara.vercel.app

# Database
MONGODB_URI=your-mongodb-connection-string
REDIS_URL=your-redis-connection-string

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback

# Blockchain
PRIVATE_KEY=your-private-key
ETHEREUM_RPC_URL=your-rpc-url
CARBON_CREDIT_CONTRACT_ADDRESS=your-contract-address

# Cloud Storage
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
STORAGE_BUCKET=your-bucket-name

# IPFS
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret
```

---

## 📝 Step 6: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add remote
git remote add origin https://github.com/Oceara/oceara-web-platform.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Oceara Web Platform

- Complete Next.js frontend with Three.js globe
- Express.js backend with MongoDB
- Smart contracts for carbon credits
- AI/ML models for verification
- Comprehensive documentation
- Production-ready deployment configuration"

# Push to main branch
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

---

## 🔄 Step 7: Set Up Continuous Deployment

### Vercel Auto-Deploy

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and pushes to other branches

### Configure Branch Deployment

In Vercel Dashboard → Settings → Git:
- **Production Branch**: `main`
- **Preview Branches**: All branches
- **Ignored Build Step**: (optional) Add conditions

---

## 🧪 Step 8: Test Deployment

### Frontend Tests

```bash
# Test production build locally
cd frontend
npm run build
npm start

# Visit http://localhost:3000
```

### Backend Tests

```bash
# Test backend locally
cd backend
npm run build
npm start

# Test API
curl http://localhost:5000/health
```

### Integration Tests

1. Test authentication flow
2. Test API endpoints
3. Test WebSocket connections
4. Test file uploads
5. Test blockchain interactions

---

## 📊 Step 9: Monitor Deployment

### Vercel Analytics

Enable in Vercel Dashboard:
- **Analytics**: Real-time visitor data
- **Speed Insights**: Performance metrics
- **Logs**: Runtime logs

### Backend Monitoring

Set up monitoring on your backend platform:
- **Railway**: Built-in metrics
- **Render**: Monitoring dashboard
- **Custom**: Prometheus + Grafana

---

## 🔧 Step 10: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `oceara.com`)
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## 🚨 Troubleshooting

### Build Fails on Vercel

**Issue**: Build fails with module errors

**Solution**:
```bash
# Clear cache
vercel --force

# Check build logs
vercel logs

# Test build locally
npm run build
```

### Environment Variables Not Working

**Issue**: Environment variables undefined

**Solution**:
1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding variables
3. Check variable names (case-sensitive)

### API Requests Failing

**Issue**: CORS errors or 404s

**Solution**:
1. Update `NEXT_PUBLIC_API_URL` to backend URL
2. Configure CORS on backend:
   ```typescript
   app.use(cors({
     origin: 'https://oceara.vercel.app',
     credentials: true
   }));
   ```

### Three.js Not Loading

**Issue**: Three.js bundle too large

**Solution**:
```javascript
// Use dynamic imports
const Globe = dynamic(() => import('@/components/globe/IntegratedGlobe'), {
  ssr: false,
  loading: () => <div>Loading globe...</div>
});
```

---

## 📋 Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Database connected and accessible
- [ ] Redis connected
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] WebSocket connections working
- [ ] File uploads working
- [ ] Monitoring enabled
- [ ] Analytics configured
- [ ] Error tracking enabled (Sentry)
- [ ] Documentation updated with live URLs

---

## 🔗 Important URLs

After deployment, update these in your documentation:

- **Production Frontend**: https://oceara.vercel.app
- **Staging Frontend**: https://oceara-staging.vercel.app
- **Backend API**: https://your-backend-url.com
- **API Documentation**: https://your-backend-url.com/api-docs
- **GitHub Repository**: https://github.com/Oceara/oceara-web-platform
- **Mobile App Repository**: https://github.com/Oceara/Oceara-blue-carbon-mrv

---

## 🎉 Success!

Your Oceara Web Platform is now live! 🌊

**Next Steps**:
1. Monitor deployment logs
2. Test all features
3. Set up error tracking (Sentry)
4. Configure analytics
5. Share with users!

---

## 📞 Support

- **Deployment Issues**: Check Vercel/Railway logs
- **Code Issues**: Open GitHub issue
- **Security Concerns**: security@oceara.com

---

**Last Updated**: January 2025  
**Version**: 1.0.0
