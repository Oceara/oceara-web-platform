# 🗺️ Google Maps API Setup Guide

This guide will help you set up Google Maps API for the Oceara platform.

## Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "Oceara Platform"
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable these APIs:
     - ✅ **Maps JavaScript API**
     - ✅ **Maps Static API**
     - ✅ **Places API**
     - ✅ **Geocoding API**

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key (looks like: `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`)

5. **Restrict API Key** (Optional but Recommended)
   - Click on your API key to edit it
   - Under "Application restrictions":
     - Select "HTTP referrers"
     - Add: `localhost:3000/*` and your Vercel domain
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose the 4 APIs listed above
   - Click "Save"

## Step 2: Add API Key to Your Project

### For Local Development:

Create a `.env.local` file in your project root:

```bash
# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: Your Google Maps API key
   - **Environment**: Production, Preview, Development
4. Click "Save"
5. Redeploy your project

## Step 3: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Landowner section

3. Click on "Register" → "Point on Map"

4. You should see an interactive Google Maps with satellite view

## Features Enabled:

✅ **Interactive Map**: Click anywhere to select location  
✅ **Satellite View**: Real-time satellite imagery from Google Earth  
✅ **Multiple Map Types**: Satellite, Roadmap, Hybrid, Terrain  
✅ **High-Resolution Images**: 800x600 static maps at 3 zoom levels  
✅ **Real-Time Analysis**: Instant AI/ML processing  
✅ **Street View**: Optional street-level imagery  

## Cost Information:

Google Maps offers **$200 free credit per month**, which covers:
- ~28,500 map loads
- ~100,000 static map requests
- More than enough for development and small-scale production

**Free Tier Limits:**
- Maps JavaScript API: $7 per 1,000 loads
- Static Maps API: $2 per 1,000 requests
- Monthly credit: $200 (resets monthly)

## Troubleshooting:

### Map not loading?
- Check browser console for errors
- Verify API key is correct in `.env.local`
- Ensure APIs are enabled in Google Cloud Console

### "This page can't load Google Maps correctly"?
- Your API key might be restricted
- Add your domain to HTTP referrers
- Check if billing is enabled (required even for free tier)

### Satellite imagery not showing?
- Switch map type using top-right controls
- Ensure you're zoomed in enough (zoom level 15+)
- Some areas may have limited satellite coverage

## Alternative: Using Demo Mode

If you want to test without setting up Google Maps:
- A demo API key is provided in the code
- Limited to development use only
- Replace with your own key for production

## Support

For issues with Google Maps API:
- Visit: https://developers.google.com/maps/support
- Check status: https://status.cloud.google.com/

For Oceara platform issues:
- Open an issue on GitHub
- Contact: support@oceara.com

