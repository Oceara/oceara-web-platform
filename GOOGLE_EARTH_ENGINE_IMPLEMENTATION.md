# 🛰️ How to Get Real Satellite Images via Google Earth Engine

## Step 1: Get Google Earth Engine Access

### 1.1 Sign Up for Earth Engine
1. **Visit**: https://earthengine.google.com/
2. **Click "Sign up"** with your Google account
3. **Fill out the form**:
   - Purpose: Research/Education
   - Institution: Your organization
   - Use case: Environmental monitoring, carbon sequestration analysis
4. **Wait for approval** (usually 24-48 hours)

### 1.2 Verify Access
- You'll receive an email when approved
- Log in to https://code.earthengine.google.com/
- You should see the Earth Engine Code Editor

## Step 2: Create Google Cloud Project

### 2.1 Create Project
1. **Go to**: https://console.cloud.google.com/
2. **Click "New Project"**
3. **Name it**: "oceara-satellite-platform"
4. **Click "Create"**

### 2.2 Enable APIs
1. **Go to**: "APIs & Services" → "Library"
2. **Search and enable**:
   - "Earth Engine API"
   - "Maps JavaScript API" (for fallback)
3. **Wait for activation** (5-10 minutes)

## Step 3: Get OAuth 2.0 Credentials

### 3.1 Create OAuth 2.0 Client ID
1. **Go to**: "APIs & Services" → "Credentials"
2. **Click "Create Credentials"** → **"OAuth client ID"**
3. **Application type**: Select **"Web application"**
4. **Name**: "Oceara Earth Engine Client"
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
7. **Click "Create"**
8. **Copy the Client ID** (starts with something like `123456789-abc...`)

### 3.2 Why OAuth 2.0?
- ✅ **Works in browsers** (client-side)
- ✅ **No server required** for authentication
- ✅ **User-friendly** - users authenticate with their Google account
- ✅ **Secure** - tokens managed by Google
- ✅ **Perfect for web apps** like yours

## Step 4: Configure Environment Variables

### 4.1 Create .env.local file
```bash
# Google Earth Engine OAuth 2.0 Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID=your-project-id-here

# Google Maps (fallback)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYour_Google_Maps_Key_Here

# Sentinel Hub
NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=04bb8400-d48c-4b67-8f2b-81d2cf95802e
```

### 4.2 Restart Development Server
```bash
npm run dev
```

## Step 5: Test Real Satellite Images

### 5.1 Open Earth Engine Code Editor
1. **Go to**: https://code.earthengine.google.com/
2. **Test with this code**:
```javascript
// Test code to get Sentinel-2 image
var point = ee.Geometry.Point([77.2090, 28.6139]); // Delhi coordinates
var image = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(point)
  .filterDate('2024-01-01', '2024-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .first();

print('Image date:', image.get('system:time_start'));
print('Cloud cover:', image.get('CLOUDY_PIXEL_PERCENTAGE'));

// Visualize
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'True Color');
Map.centerObject(point, 15);
```

### 5.2 Get Image URL
```javascript
// Get thumbnail URL
var thumbnail = image.getThumbURL({
  dimensions: 800,
  region: point.buffer(1000).bounds(),
  format: 'png',
  crs: 'EPSG:4326'
});

print('Thumbnail URL:', thumbnail);
```

## Step 6: Implement in Your App

### 6.1 Update the Service
The service is already implemented in `lib/googleEarthEngine.ts`. It will automatically use real Earth Engine data when configured.

### 6.2 Test the Integration
1. **Hard refresh** your browser: `Ctrl + Shift + R`
2. **Go to**: Admin → Any project → "🛰️ Earth Engine Analysis"
3. **Click "⚙️ Setup"**
4. **Enter your credentials**
5. **Click "Configure"**

## Step 7: Real Satellite Data Sources

### 7.1 Sentinel-2 (Primary)
- **Resolution**: 10m (RGB), 20m (NIR)
- **Update frequency**: Every 5 days
- **Coverage**: Global
- **Bands available**: 13 spectral bands

### 7.2 Landsat 8/9 (Secondary)
- **Resolution**: 30m
- **Update frequency**: Every 16 days
- **Coverage**: Global
- **Bands available**: 11 spectral bands

### 7.3 MODIS (Daily)
- **Resolution**: 250m-1000m
- **Update frequency**: Daily
- **Coverage**: Global
- **Use case**: Large area monitoring

## Step 8: Image Processing Examples

### 8.1 True Color Image
```javascript
var trueColor = image.select(['B4', 'B3', 'B2']).multiply(0.0001);
var visParams = {min: 0, max: 0.3, bands: ['B4', 'B3', 'B2']};
```

### 8.2 NDVI Calculation
```javascript
var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndviVis = {min: -1, max: 1, palette: ['red', 'yellow', 'green']};
```

### 8.3 False Color (NIR)
```javascript
var falseColor = image.select(['B8', 'B4', 'B3']).multiply(0.0001);
var visParams = {min: 0, max: 0.3, bands: ['B8', 'B4', 'B3']};
```

## Step 9: Cost and Limits

### 9.1 Free Tier
- **Monthly quota**: 1 million pixels
- **Concurrent requests**: 10
- **Storage**: 10GB
- **Perfect for**: Research and small-scale applications

### 9.2 Paid Tier
- **Cost**: $0.001 per 1,000 pixels
- **No monthly limits**
- **Higher quotas**
- **Commercial use allowed**

## Step 10: Troubleshooting

### 10.1 Common Issues
- **"API key not valid"**: Check if Earth Engine API is enabled
- **"Project not found"**: Verify project ID is correct
- **"Quota exceeded"**: Wait for quota reset or upgrade plan
- **"No images found"**: Check date range and cloud cover filters

### 10.2 Debug Steps
1. **Check API status**: https://console.cloud.google.com/apis/dashboard
2. **Verify quotas**: https://console.cloud.google.com/apis/api/earthengine.googleapis.com/quotas
3. **Test in Code Editor**: https://code.earthengine.google.com/
4. **Check browser console** for error messages

## Step 11: Production Deployment

### 11.1 Environment Variables
Add to your production environment (Vercel/Netlify):
```
NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_API_KEY=your_production_key
NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID=your_production_project
```

### 11.2 Security
- **Restrict API keys** to your domain
- **Use environment variables** (never commit keys)
- **Monitor usage** in Google Cloud Console
- **Set up billing alerts**

## Expected Results

Once configured, you'll get:
- ✅ **Real satellite images** from Sentinel-2
- ✅ **Updated every 5 days**
- ✅ **10m resolution**
- ✅ **Live NDVI calculations**
- ✅ **Cloud-free imagery**
- ✅ **Time-series data**

The images will be much more recent and accurate than Google Maps!
