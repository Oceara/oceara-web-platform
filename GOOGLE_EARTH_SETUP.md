# 🛰️ Google Earth Engine Setup Guide

## Step 1: Get Google Earth Engine Access

1. **Visit**: https://earthengine.google.com/
2. **Sign up** with your Google account
3. **Request access** (usually approved within 24-48 hours)
4. **Accept terms** and complete registration

## Step 2: Create Google Cloud Project

1. **Go to**: https://console.cloud.google.com/
2. **Create new project** or select existing one
3. **Enable Earth Engine API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Earth Engine API"
   - Click "Enable"

## Step 3: Get API Credentials

1. **Go to**: "APIs & Services" → "Credentials"
2. **Create API Key**:
   - Click "Create Credentials" → "API Key"
   - Copy the API key
3. **Create Service Account** (for server-side access):
   - Click "Create Credentials" → "Service Account"
   - Download the JSON key file

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Google Earth Engine Configuration
NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID=your_project_id_here

# Google Maps (for fallback)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Sentinel Hub
NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=04bb8400-d48c-4b67-8f2b-81d2cf95802e

# Mapbox (for fallback)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Step 5: Test Access

Once configured, the Earth Engine integration will provide:
- ✅ Real-time Sentinel-2 imagery (updated every 5 days)
- ✅ Live NDVI calculations
- ✅ Current vegetation health analysis
- ✅ Recent cloud-free imagery
- ✅ Time-series data

## Benefits Over Google Maps

| Feature | Google Maps | Google Earth Engine |
|---------|-------------|-------------------|
| **Update Frequency** | Monthly/Yearly | Every 5 days |
| **Resolution** | 1-2 meters | 10-20 meters |
| **Data Types** | Visual only | Multi-spectral |
| **Analysis** | None | NDVI, EVI, etc. |
| **Real-time** | No | Yes |
| **Cost** | Free tier limited | Free for research |
