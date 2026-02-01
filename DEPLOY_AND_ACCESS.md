# Deploy to GitHub & Vercel + Full Access

## Deploy to [Oceara/oceara-web-platform](https://github.com/Oceara/oceara-web-platform)

1. **Push this project to the repo:**
   ```bash
   cd oceara-simple-deploy   # or your folder name
   git remote add origin https://github.com/Oceara/oceara-web-platform.git
   git add .
   git commit -m "MRV phase: feature flags, slimmer repo"
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `Oceara/oceara-web-platform`
   - Deploy (uses same GitHub link)

## Give yourself full access (Wallet, Buy, Marketplace)

- **Default:** Public sees MRV-only (no wallet, no buy/sell).
- **Your access:** Add your email to the allowlist so you see all features.

**Steps:**

1. Vercel → your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `NEXT_PUBLIC_FULL_ACCESS_EMAILS`
   - **Value:** `your.email@example.com` (or comma-separated for multiple)
3. **Redeploy** (Deployments → ⋮ → Redeploy)

Sign in with that email (Google or demo). You will see Wallet, Buy Credits, and full marketplace; others will not.
