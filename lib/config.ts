// Configuration file for API keys and environment variables

// Google Maps API Key - Used for maps, satellite imagery, and location services
// Get your key from: https://console.cloud.google.com/google/maps-apis
export const GOOGLE_MAPS_API_KEY = 
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
  'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8' // Fallback demo key

// Mapbox Token - Fallback for satellite imagery if Google Maps quota exceeded
export const MAPBOX_TOKEN = 
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 
  'pk.eyJ1Ijoib2NlYXJhIiwiYSI6ImNsZjN4eXoycjBhZjAzcW85d2VxdTBqZ3QifQ.1234567890' // Demo token

// Supabase Configuration (Optional)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Firebase Configuration (Optional)
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

// Helper function to generate Google Maps Static API URL
export function getGoogleMapsStaticUrl(
  lat: number,
  lng: number,
  zoom: number = 16,
  size: string = '800x600',
  maptype: 'satellite' | 'roadmap' | 'hybrid' | 'terrain' = 'satellite',
  markers?: boolean
): string {
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  const center = `center=${lat},${lng}`
  const zoomParam = `zoom=${zoom}`
  const sizeParam = `size=${size}`
  const maptypeParam = `maptype=${maptype}`
  const scaleParam = `scale=2` // High resolution
  const markerParam = markers ? `&markers=color:red%7C${lat},${lng}` : ''
  
  return `${baseUrl}?${center}&${zoomParam}&${sizeParam}&${maptypeParam}&${scaleParam}${markerParam}&key=${GOOGLE_MAPS_API_KEY}`
}

// Helper function to load Google Maps JavaScript API
export function loadGoogleMapsScript(libraries: string[] = ['places', 'drawing', 'geometry']): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', reject)
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraries.join(',')}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Check if Google Maps API key is configured
export function isGoogleMapsConfigured(): boolean {
  return GOOGLE_MAPS_API_KEY !== '' && GOOGLE_MAPS_API_KEY !== 'your_api_key_here'
}

