# Deploy easily with Yash5274

## 1. Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `oceara-web-platform`
3. **Owner:** Yash5274 (your account)
4. Leave "Add a README" **unchecked**
5. Click **Create repository**

## 2. Push this project

From the `oceara-simple-deploy` folder:

```bash
git push yash main
```

If you get "remote not found", add the remote first:

```bash
git remote add yash https://github.com/Yash5274/oceara-web-platform.git
git push yash main
```

## 3. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository:** select **Yash5274/oceara-web-platform**
3. Click **Deploy**
4. Your site will be live in ~2 minutes.

Or use the one-click button in the README: **Deploy with Vercel (Yash5274)**.

---

**Full access (Wallet, Buy, Marketplace):** In Vercel → Settings → Environment Variables, add `NEXT_PUBLIC_FULL_ACCESS_EMAILS` = your email, then redeploy.
