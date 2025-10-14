// Test script to verify Google Earth Engine connection
// Run with: node scripts/test-earth-engine.js

const https = require('https');

// Test function to check if Earth Engine API is accessible
async function testEarthEngineAPI(apiKey, projectId) {
  console.log('🛰️ Testing Google Earth Engine API...\n');
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log('❌ API Key not configured');
    console.log('   Please set NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_API_KEY in .env.local');
    return false;
  }
  
  if (!projectId || projectId === 'your_project_id_here') {
    console.log('❌ Project ID not configured');
    console.log('   Please set NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID in .env.local');
    return false;
  }
  
  // Test coordinates (Delhi, India)
  const coordinates = { lat: 28.6139, lng: 77.2090 };
  
  // Test URL for Earth Engine thumbnail
  const testUrl = `https://earthengine.googleapis.com/v1alpha/projects/${projectId}/thumbnails?dimensions=400x400&format=png&region=${coordinates.lat},${coordinates.lng}&visParams=${encodeURIComponent(JSON.stringify({
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 3000
  }))}&key=${apiKey}`;
  
  console.log('📍 Testing coordinates:', coordinates);
  console.log('🔗 Test URL:', testUrl.substring(0, 100) + '...');
  console.log('');
  
  return new Promise((resolve) => {
    const req = https.get(testUrl, (res) => {
      console.log('📊 Response Status:', res.statusCode);
      console.log('📋 Response Headers:', {
        'content-type': res.headers['content-type'],
        'content-length': res.headers['content-length']
      });
      
      if (res.statusCode === 200) {
        console.log('✅ Earth Engine API is working!');
        console.log('🖼️  Image data received successfully');
        resolve(true);
      } else if (res.statusCode === 403) {
        console.log('❌ API Key invalid or quota exceeded');
        console.log('   Check your API key and billing settings');
        resolve(false);
      } else if (res.statusCode === 404) {
        console.log('❌ Project not found');
        console.log('   Verify your project ID is correct');
        resolve(false);
      } else {
        console.log('❌ Unexpected error:', res.statusCode);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ Network error:', error.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test different satellite data sources
async function testSatelliteSources(apiKey, projectId) {
  console.log('\n🛰️ Testing different satellite data sources...\n');
  
  const sources = [
    {
      name: 'Sentinel-2 True Color',
      visParams: { bands: ['B4', 'B3', 'B2'], min: 0, max: 3000 }
    },
    {
      name: 'Sentinel-2 False Color',
      visParams: { bands: ['B8', 'B4', 'B3'], min: 0, max: 3000 }
    },
    {
      name: 'Landsat 8 True Color',
      visParams: { bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3 }
    }
  ];
  
  const coordinates = { lat: 28.6139, lng: 77.2090 };
  
  for (const source of sources) {
    console.log(`🔍 Testing ${source.name}...`);
    
    const testUrl = `https://earthengine.googleapis.com/v1alpha/projects/${projectId}/thumbnails?dimensions=200x200&format=png&region=${coordinates.lat},${coordinates.lng}&visParams=${encodeURIComponent(JSON.stringify(source.visParams))}&key=${apiKey}`;
    
    try {
      const result = await new Promise((resolve) => {
        const req = https.get(testUrl, (res) => {
          resolve(res.statusCode === 200);
        });
        
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(false);
        });
      });
      
      if (result) {
        console.log(`   ✅ ${source.name} - Working`);
      } else {
        console.log(`   ❌ ${source.name} - Failed`);
      }
    } catch (error) {
      console.log(`   ❌ ${source.name} - Error: ${error.message}`);
    }
  }
}

// Main test function
async function main() {
  console.log('🚀 Google Earth Engine API Test\n');
  console.log('=====================================\n');
  
  // Get environment variables (you'll need to set these)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID;
  
  // Test basic API connection
  const isWorking = await testEarthEngineAPI(apiKey, projectId);
  
  if (isWorking) {
    // Test different data sources
    await testSatelliteSources(apiKey, projectId);
    
    console.log('\n🎉 All tests completed!');
    console.log('✅ Your Google Earth Engine integration is ready');
    console.log('\n📝 Next steps:');
    console.log('   1. Hard refresh your browser (Ctrl + Shift + R)');
    console.log('   2. Go to Admin → Any project → Earth Engine Analysis');
    console.log('   3. You should see "✅ Real-time" status');
  } else {
    console.log('\n❌ Setup incomplete');
    console.log('\n📝 To fix this:');
    console.log('   1. Get Google Earth Engine access: https://earthengine.google.com/');
    console.log('   2. Create Google Cloud project: https://console.cloud.google.com/');
    console.log('   3. Enable Earth Engine API');
    console.log('   4. Create API key');
    console.log('   5. Add credentials to .env.local file');
    console.log('   6. Run this test again');
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEarthEngineAPI, testSatelliteSources };
