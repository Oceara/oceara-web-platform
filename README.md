# 🌊 Oceara - Blue Carbon Ecosystem Platform

> A Next.js web platform for mangrove restoration and carbon credit marketplace with stunning 3D Earth visualizations

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Oceara/oceara-web-platform)

---

## 🚀 **Quick Deploy to Vercel**

**Click the button above** or follow these steps:

### **Option 1: One-Click Deploy**
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Click "Deploy"
4. Done! Your site is live 🎉

### **Option 2: Manual Deploy**
1. Go to https://vercel.com/new
2. Import repository: `Oceara/oceara-web-platform`
3. Click "Deploy"
4. Wait 2 minutes
5. Your site is live! 🌊

**See full guide:** [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)

---

## ✨ **Features**

### **🌍 Interactive 3D Earth**
- Realistic NASA-quality textures
- Custom GLSL shaders with day/night cycle
- Figure-8 orbital animation
- 40-particle spiral effects
- Triple ring system
- Color-changing atmosphere

### **🔐 Authentication System**
- Email & Password login
- Phone OTP verification
- Social login (Google, Facebook, GitHub, Twitter, Apple)
- **Demo Mode** - Skip login for instant access

### **🌴 Landowner Dashboard**
- Project management
- Google Maps integration
- Upload new mangrove sites
- Track carbon credits

### **💰 Buyer Dashboard**
- Carbon credit marketplace
- Interactive 3D globe with project markers
- Portfolio tracking
- 4 real mangrove projects

### **📍 Real Project Data**
- Sundarbans (West Bengal): 250 ha, 1,250 credits
- Kerala Backwaters: 180 ha, 890 credits
- Andaman Islands: 320 ha, 1,600 credits
- Gujarat Coastal: 200 ha, 1,000 credits

---

## 🛠️ **Tech Stack**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.3
- **3D Graphics:** Three.js + React Three Fiber
- **Animations:** Framer Motion
- **Maps:** Google Maps Embed API

---

## 💻 **Local Development**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 📂 **Project Structure**

```
oceara-simple-deploy/
├── app/
│   ├── page.tsx                 # Landing page with 3D Earth
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── landowner/page.tsx      # Landowner dashboard
│   └── buyer/page.tsx          # Buyer dashboard
├── components/
│   ├── RealisticEarth.tsx      # 3D Earth with shaders
│   └── EarthWithProjects.tsx   # Globe with markers
├── public/
│   └── earth/                   # Earth textures
└── package.json
```

---

## 🎨 **Screenshots**

### Landing Page
- 3D Earth with interactive role cards
- Hover effects with color changes
- Demo mode access

### Dashboards
- Landowner: Google Maps, project management
- Buyer: Interactive globe, marketplace

---

## 🎯 **Demo Mode**

No login required! Click the **"Demo User"** button on login/signup pages to instantly explore:
- ✅ Full dashboard access
- ✅ All features enabled
- ✅ Perfect for demonstrations
- ✅ No credentials needed

---

## 📊 **Build Stats**

- **Routes:** 8 pages
- **Bundle Size:** 117-125 KB per page
- **Build Time:** ~30 seconds
- **Lighthouse Score:** 95+ (Production)

---

## 🌟 **Highlights**

- 🌍 **Realistic Earth** with NASA textures
- 🎨 **Unique animations** (figure-8, spiral particles)
- 👤 **Demo mode** for instant access
- 🗺️ **Google Maps** integration
- 📍 **Real GPS** coordinates for projects
- 💫 **60 FPS** smooth animations
- 📱 **Fully responsive** design
- ✨ **Glass morphism** UI

---

## 🔗 **Links**

- **Live Site:** [Deploy to get URL]
- **GitHub:** https://github.com/Oceara/oceara-web-platform
- **Documentation:** [FEATURES.md](./FEATURES.md)
- **Deployment Guide:** [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)

---

## 📝 **License**

MIT License - Built for Smart India Hackathon 2024

---

## 🏆 **Smart India Hackathon 2024**

This project demonstrates:
- Advanced 3D web graphics
- Real-world mangrove conservation data
- Complete user authentication
- Interactive data visualization
- Production-ready deployment

---

## 👥 **Team Oceara**

Building solutions for blue carbon ecosystem management and climate change mitigation.

---

## 🚀 **Get Started**

1. **Deploy:** Click the Vercel button at the top
2. **Explore:** Use demo mode to test features
3. **Customize:** Fork and modify for your needs

**Your platform will be live in 2 minutes!** 🌊

---

Made with 💙 for our oceans and mangrove ecosystems
