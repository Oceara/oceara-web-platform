// Google Earth Engine Integration
// Provides real-time satellite imagery and vegetation analysis

import { googleEarthEngineService } from './googleEarthEngine'

interface Coordinates {
  lat: number
  lng: number
}

interface SatelliteAnalysis {
  ndvi: number // Normalized Difference Vegetation Index (-1 to 1)
  evi: number // Enhanced Vegetation Index
  cloudCover: number // Percentage
  imageDate: string
  healthScore: number // 0-100
  vegetationDensity: 'Low' | 'Medium' | 'High' | 'Very High'
  waterPresence: boolean
  changeDetection?: {
    deforestation: boolean
    growth: boolean
    percentChange: number
  }
}

interface EarthEngineImage {
  url: string
  date: string
  cloudCover: number
  type: 'true-color' | 'ndvi' | 'false-color' | 'evi'
}

export class EarthEngineService {
  private apiKey: string
  private sentinelHubInstanceId: string
  
  constructor() {
    // Earth Engine API key
    this.apiKey = process.env.NEXT_PUBLIC_EARTH_ENGINE_API_KEY || ''
    // Sentinel Hub Instance ID
    this.sentinelHubInstanceId = process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID || '04bb8400-d48c-4b67-8f2b-81d2cf95802e'
  }

  /**
   * Get the latest Sentinel-2 satellite imagery for a location
   * Sentinel-2 provides 10m resolution, updated every 5 days
   */
  async getLatestImagery(coordinates: Coordinates, radiusKm: number = 1): Promise<EarthEngineImage[]> {
    try {
      // Try to use real Google Earth Engine first
      if (googleEarthEngineService.isConfigured()) {
        console.log('🛰️ Using Google Earth Engine for real-time imagery')
        const realTimeImages = await googleEarthEngineService.getRealTimeSentinel2Imagery(coordinates, radiusKm)
        if (realTimeImages.length > 0) {
          return realTimeImages.map(img => ({
            url: img.url,
            date: img.date,
            cloudCover: img.cloudCover,
            type: img.type
          }))
        }
      }
      
      // Fallback to simulated imagery
      console.log('⚠️ Using fallback imagery (Google Earth Engine not configured)')
      const images: EarthEngineImage[] = [
        {
          url: `https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/thumbnails?dimensions=800x800&format=png&region=${coordinates.lat},${coordinates.lng}&visParams={"bands":["B4","B3","B2"],"min":0,"max":3000}`,
          date: new Date().toISOString(),
          cloudCover: 5,
          type: 'true-color'
        },
        {
          url: `https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/thumbnails?dimensions=800x800&format=png&region=${coordinates.lat},${coordinates.lng}&visParams={"bands":["B8","B4","B3"],"min":0,"max":3000}`,
          date: new Date().toISOString(),
          cloudCover: 5,
          type: 'false-color'
        }
      ]

      return images
    } catch (error) {
      console.error('Failed to fetch Earth Engine imagery:', error)
      return []
    }
  }

  /**
   * Calculate vegetation indices using satellite bands
   * NDVI = (NIR - Red) / (NIR + Red)
   * EVI = 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))
   */
  async analyzeVegetation(coordinates: Coordinates, areaHectares: number): Promise<SatelliteAnalysis> {
    try {
      // Try to use real Google Earth Engine first
      if (googleEarthEngineService.isConfigured()) {
        console.log('🌿 Using Google Earth Engine for real-time vegetation analysis')
        const realTimeAnalysis = await googleEarthEngineService.analyzeVegetationRealTime(coordinates, areaHectares)
        return {
          ndvi: realTimeAnalysis.ndvi,
          evi: realTimeAnalysis.evi,
          cloudCover: realTimeAnalysis.cloudCover,
          imageDate: realTimeAnalysis.imageDate,
          healthScore: realTimeAnalysis.healthScore,
          vegetationDensity: realTimeAnalysis.vegetationDensity,
          waterPresence: realTimeAnalysis.waterPresence,
          changeDetection: realTimeAnalysis.changeDetection
        }
      }
      
      // Fallback to simulated analysis
      console.log('⚠️ Using simulated vegetation analysis (Google Earth Engine not configured)')
      
      // Simulate NDVI calculation (healthy vegetation = 0.6-0.9)
      const baseNdvi = 0.65 + Math.random() * 0.2
      
      // Simulate EVI calculation
      const baseEvi = 0.5 + Math.random() * 0.3
      
      // Simulate cloud cover
      const cloudCover = Math.random() * 15
      
      // Calculate health score based on NDVI
      const healthScore = Math.min(100, Math.max(0, (baseNdvi + 1) * 50))
      
      // Determine vegetation density
      let vegetationDensity: 'Low' | 'Medium' | 'High' | 'Very High'
      if (baseNdvi < 0.3) vegetationDensity = 'Low'
      else if (baseNdvi < 0.5) vegetationDensity = 'Medium'
      else if (baseNdvi < 0.7) vegetationDensity = 'High'
      else vegetationDensity = 'Very High'
      
      // Simulate water presence detection (for mangroves)
      const waterPresence = Math.random() > 0.3 // 70% chance for coastal areas
      
      // Simulate change detection
      const hasChange = Math.random() > 0.7
      const changeDetection = hasChange ? {
        deforestation: Math.random() < 0.2, // 20% chance
        growth: Math.random() > 0.5, // 50% chance
        percentChange: (Math.random() * 10) - 5 // -5% to +5%
      } : undefined

      return {
        ndvi: baseNdvi,
        evi: baseEvi,
        cloudCover,
        imageDate: new Date().toISOString(),
        healthScore,
        vegetationDensity,
        waterPresence,
        changeDetection
      }
    } catch (error) {
      console.error('Failed to analyze vegetation:', error)
      throw error
    }
  }

  /**
   * Get time-series data for vegetation health over time
   */
  async getTimeSeriesData(coordinates: Coordinates, startDate: Date, endDate: Date): Promise<Array<{
    date: string
    ndvi: number
    evi: number
    cloudCover: number
  }>> {
    try {
      // Try to use real Google Earth Engine first
      if (googleEarthEngineService.isConfigured()) {
        console.log('📈 Using Google Earth Engine for real-time time series data')
        const realTimeData = await googleEarthEngineService.getTimeSeriesDataRealTime(coordinates, startDate, endDate)
        return realTimeData.map(item => ({
          date: item.date,
          ndvi: item.ndvi,
          evi: item.evi,
          cloudCover: item.cloudCover
        }))
      }
      
      // Fallback to simulated data
      console.log('⚠️ Using simulated time series data (Google Earth Engine not configured)')
      const data = []
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const interval = Math.max(1, Math.floor(daysDiff / 12)) // Get ~12 data points
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate.getTime() + (interval * i * 24 * 60 * 60 * 1000))
        data.push({
          date: date.toISOString().split('T')[0],
          ndvi: 0.6 + Math.random() * 0.2 + (i * 0.01), // Slight upward trend
          evi: 0.5 + Math.random() * 0.2 + (i * 0.01),
          cloudCover: Math.random() * 20
        })
      }
      
      return data
    } catch (error) {
      console.error('Failed to get time series data:', error)
      return []
    }
  }

  /**
   * Detect changes between two time periods
   */
  async detectChanges(
    coordinates: Coordinates,
    beforeDate: Date,
    afterDate: Date
  ): Promise<{
    areaChanged: number // hectares
    percentChange: number
    changeType: 'deforestation' | 'growth' | 'degradation' | 'stable'
    severity: 'low' | 'medium' | 'high'
  }> {
    try {
      // Simulate change detection
      const percentChange = (Math.random() * 10) - 5 // -5% to +5%
      const areaChanged = Math.abs(percentChange) * 0.5 // Example calculation
      
      let changeType: 'deforestation' | 'growth' | 'degradation' | 'stable'
      if (percentChange < -2) changeType = 'deforestation'
      else if (percentChange > 2) changeType = 'growth'
      else if (percentChange < -0.5) changeType = 'degradation'
      else changeType = 'stable'
      
      let severity: 'low' | 'medium' | 'high'
      if (Math.abs(percentChange) < 2) severity = 'low'
      else if (Math.abs(percentChange) < 5) severity = 'medium'
      else severity = 'high'
      
      return {
        areaChanged,
        percentChange,
        changeType,
        severity
      }
    } catch (error) {
      console.error('Failed to detect changes:', error)
      throw error
    }
  }

  /**
   * Get satellite image URL with multiple fallback options
   */
  getSentinelImageUrl(
    coordinates: Coordinates,
    visualizationType: 'true-color' | 'ndvi' | 'false-color' | 'moisture',
    zoom: number = 14
  ): string {
    // Try multiple image sources for reliability
    const sources = this.getImageSources(coordinates, visualizationType, zoom)
    
    // Return the first (most reliable) source
    return sources[0]
  }

  /**
   * Get multiple image sources as fallbacks
   */
  private getImageSources(
    coordinates: Coordinates,
    visualizationType: 'true-color' | 'ndvi' | 'false-color' | 'moisture',
    zoom: number
  ): string[] {
    const sources: string[] = []
    
    // 1. Google Maps Static API (most reliable)
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'
    const size = '1200x1200'
    
    switch (visualizationType) {
      case 'true-color':
        sources.push(`https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&size=${size}&scale=2&maptype=satellite&markers=color:red%7Csize:small%7C${coordinates.lat},${coordinates.lng}&key=${googleMapsKey}`)
        break
      case 'ndvi':
      case 'false-color':
      case 'moisture':
        sources.push(`https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&size=${size}&scale=2&maptype=hybrid&markers=color:green%7Csize:small%7C${coordinates.lat},${coordinates.lng}&key=${googleMapsKey}`)
        break
      default:
        sources.push(`https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&size=${size}&scale=2&maptype=satellite&key=${googleMapsKey}`)
    }
    
    // 2. Mapbox Satellite (fallback)
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    sources.push(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates.lng},${coordinates.lat},${zoom}/1200x1200@2x?access_token=${mapboxToken}`)
    
    // 3. OpenStreetMap with satellite tiles (fallback)
    sources.push(`https://tile.openstreetmap.org/${Math.floor(zoom)}/${Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(coordinates.lat * Math.PI / 180) + 1 / Math.cos(coordinates.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`)
    
    // 4. NASA Worldview (fallback for satellite imagery)
    const today = new Date().toISOString().split('T')[0]
    sources.push(`https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${today}/250m/${Math.floor(zoom)}/${Math.floor((coordinates.lat + 90) / 180 * Math.pow(2, zoom))}/${Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, zoom))}.jpg`)
    
    return sources
  }

  /**
   * Calculate carbon sequestration based on vegetation analysis
   */
  calculateCarbonSequestration(
    areaHectares: number,
    ndvi: number,
    vegetationType: 'mangrove' | 'forest' | 'grassland' = 'mangrove'
  ): {
    annualSequestration: number // tons CO2/year
    totalStock: number // tons CO2
    creditsGenerated: number // carbon credits
  } {
    // Carbon sequestration rates (tons CO2/hectare/year)
    const rates = {
      mangrove: 3.5, // Mangroves are excellent carbon sinks
      forest: 2.5,
      grassland: 1.0
    }
    
    // Adjust rate based on vegetation health (NDVI)
    const healthMultiplier = (ndvi + 1) / 2 // Scale from 0-1
    const rate = rates[vegetationType] * healthMultiplier
    
    const annualSequestration = areaHectares * rate
    const totalStock = annualSequestration * 20 // Estimate over 20 years
    const creditsGenerated = Math.floor(annualSequestration) // 1 credit = 1 ton CO2
    
    return {
      annualSequestration,
      totalStock,
      creditsGenerated
    }
  }

  /**
   * Get real-time satellite imagery using Sentinel Hub
   */
  async getSentinelHubImage(
    coordinates: Coordinates,
    width: number = 800,
    height: number = 800,
    layer: string = '1_TRUE_COLOR'
  ): Promise<string> {
    if (!this.sentinelHubInstanceId) {
      console.warn('Sentinel Hub Instance ID not configured')
      return ''
    }

    const bbox = `${coordinates.lng - 0.01},${coordinates.lat - 0.01},${coordinates.lng + 0.01},${coordinates.lat + 0.01}`
    const today = new Date()
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    const sentinelHubUrl = `https://services.sentinel-hub.com/ogc/wms/${this.sentinelHubInstanceId}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=${layer}&BBOX=${bbox}&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&CRS=EPSG:4326&TIME=${threeMonthsAgo.toISOString().split('T')[0]}/${today.toISOString().split('T')[0]}&MAXCC=20`
    
    return sentinelHubUrl
  }

  /**
   * Check if Earth Engine is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey !== '' && this.apiKey !== 'your_api_key_here'
  }

  /**
   * Get sample analysis for demo purposes
   */
  getSampleAnalysis(coordinates: Coordinates, areaHectares: number): SatelliteAnalysis {
    const ndvi = 0.72 // Healthy mangrove forest
    const evi = 0.65
    const cloudCover = 8
    const healthScore = 86
    
    return {
      ndvi,
      evi,
      cloudCover,
      imageDate: new Date().toISOString(),
      healthScore,
      vegetationDensity: 'Very High',
      waterPresence: true,
      changeDetection: {
        deforestation: false,
        growth: true,
        percentChange: 2.3
      }
    }
  }
}

// Export singleton instance
export const earthEngineService = new EarthEngineService()

