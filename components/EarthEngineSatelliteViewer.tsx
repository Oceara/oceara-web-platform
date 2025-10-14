'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { earthEngineService } from '@/lib/earthEngine'
import { googleEarthEngineService } from '@/lib/googleEarthEngine'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import GoogleEarthEngineSetup from './GoogleEarthEngineSetup'

interface EarthEngineSatelliteViewerProps {
  coordinates: { lat: number; lng: number }
  projectName: string
  area: number // in hectares
  onClose?: () => void
}

type ViewType = 'true-color' | 'ndvi' | 'false-color' | 'moisture'

export default function EarthEngineSatelliteViewer({
  coordinates,
  projectName,
  area,
  onClose
}: EarthEngineSatelliteViewerProps) {
  const [viewType, setViewType] = useState<ViewType>('true-color')
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [zoom, setZoom] = useState(14)
  const [imageError, setImageError] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [isGoogleEarthEngineReady, setIsGoogleEarthEngineReady] = useState(false)

  useEffect(() => {
    loadSatelliteData()
    // Check if Google Earth Engine is configured
    const status = googleEarthEngineService.getConfigurationStatus()
    setIsGoogleEarthEngineReady(status.ready)
  }, [coordinates])

  useEffect(() => {
    // Update image URL when view type or zoom changes
    const newUrl = earthEngineService.getSentinelImageUrl(coordinates, viewType, zoom)
    setCurrentImageUrl(newUrl)
    setImageError(false)
  }, [viewType, zoom, coordinates])

  const loadSatelliteData = async () => {
    setLoading(true)
    try {
      // Get vegetation analysis
      const analysisData = await earthEngineService.analyzeVegetation(coordinates, area)
      setAnalysis(analysisData)

      // Get time series data (last 6 months)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6)
      const timeSeries = await earthEngineService.getTimeSeriesData(coordinates, startDate, endDate)
      setTimeSeriesData(timeSeries)

      setLoading(false)
      toast.success('Satellite data loaded!', { icon: '🛰️' })
    } catch (error) {
      console.error('Error loading satellite data:', error)
      // Use sample data as fallback
      const sampleAnalysis = earthEngineService.getSampleAnalysis(coordinates, area)
      setAnalysis(sampleAnalysis)
      setLoading(false)
    }
  }

  const tryFallbackImage = () => {
    // Get all available image sources from the service
    const allSources = earthEngineService.getImageSources(coordinates, viewType, zoom)
    
    // Find current source index
    const currentIndex = allSources.indexOf(currentImageUrl)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < allSources.length) {
      // Try next source
      setCurrentImageUrl(allSources[nextIndex])
      setImageError(false)
      console.log(`🔄 Trying fallback source ${nextIndex + 1}/${allSources.length}`)
    } else {
      // All sources failed, show error message
      console.error('❌ All image sources failed to load')
      toast.error('Unable to load satellite imagery from any source', { icon: '⚠️' })
    }
  }

  const viewTypes = [
    { id: 'true-color', label: 'True Color', icon: '🌍', description: 'Natural colors' },
    { id: 'ndvi', label: 'NDVI', icon: '🌿', description: 'Vegetation health' },
    { id: 'false-color', label: 'False Color', icon: '🎨', description: 'Infrared view' },
    { id: 'moisture', label: 'Moisture', icon: '💧', description: 'Water content' }
  ]

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20'
    if (score >= 60) return 'bg-yellow-500/20'
    if (score >= 40) return 'bg-orange-500/20'
    return 'bg-red-500/20'
  }

  const carbonData = analysis ? earthEngineService.calculateCarbonSequestration(
    area,
    analysis.ndvi,
    'mangrove'
  ) : null

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">🛰️ Earth Engine Satellite Analysis</h2>
                {isGoogleEarthEngineReady ? (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm font-semibold">
                    ✅ Real-time
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-400 text-sm font-semibold">
                    ⚠️ Demo Mode
                  </span>
                )}
              </div>
              <p className="text-gray-300">{projectName}</p>
              <p className="text-gray-400 text-sm">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)} • Area: {area} ha
              </p>
              {!isGoogleEarthEngineReady && (
                <p className="text-yellow-400 text-sm mt-1">
                  💡 Configure Google Earth Engine for real-time satellite imagery
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {!isGoogleEarthEngineReady && (
                <button
                  onClick={() => setShowSetup(true)}
                  className="bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 rounded-xl px-6 py-3 text-white font-semibold transition-all flex items-center gap-2"
                >
                  <span>⚙️</span>
                  <span>Setup</span>
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-xl px-6 py-3 text-white font-semibold transition-all"
                >
                  ✕ Close
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Satellite Image */}
            <div className="lg:col-span-2 space-y-6">
              {/* View Type Selector */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {viewTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setViewType(type.id as ViewType)}
                      className={`p-4 rounded-lg transition-all text-center ${
                        viewType === type.id
                          ? 'bg-purple-600 border-2 border-purple-400'
                          : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-white font-semibold text-sm">{type.label}</div>
                      <div className="text-gray-400 text-xs">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Satellite Image Display */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-xl overflow-hidden">
                <div className="relative">
                  {loading ? (
                    <div className="w-full h-[500px] flex items-center justify-center bg-slate-900">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">🛰️</div>
                        <p className="text-white font-semibold">Loading satellite imagery...</p>
                        <p className="text-gray-400 text-sm mt-2">High-resolution satellite data</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {!imageError ? (
                        <img
                          src={currentImageUrl}
                          alt={`Satellite view - ${viewType}`}
                          className="w-full h-[500px] object-cover"
                          onLoad={() => {
                            console.log('✅ Satellite image loaded successfully')
                          }}
                          onError={(e) => {
                            console.error('❌ Satellite image failed to load:', e)
                            console.log('Current URL:', currentImageUrl)
                            setImageError(true)
                            // Try fallback sources after a short delay
                            setTimeout(() => {
                              tryFallbackImage()
                            }, 500)
                          }}
                        />
                      ) : (
                        <div className="w-full h-[500px] bg-slate-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-4">🛰️</div>
                            <p className="text-white font-semibold mb-2">Satellite Image Loading...</p>
                            <p className="text-gray-400 text-sm">Trying alternative sources...</p>
                            <div className="mt-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay Info */}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white text-sm font-semibold">{viewTypes.find(v => v.id === viewType)?.label}</div>
                        <div className="text-gray-300 text-xs">High-resolution satellite • Updated today</div>
                        <div className="text-gray-300 text-xs">
                          Zoom: {zoom}x • Location: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </div>
                      </div>

                      {/* Cloud Cover Badge */}
                      {analysis && analysis.cloudCover < 20 && (
                        <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="text-white text-sm font-semibold">☁️ {analysis.cloudCover.toFixed(1)}% clouds</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Zoom Controls */}
                <div className="p-4 border-t-2 border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom(Math.max(10, zoom - 1))}
                      className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white font-semibold"
                    >
                      −
                    </button>
                    <span className="text-white font-semibold px-4">Zoom: {zoom}x</span>
                    <button
                      onClick={() => setZoom(Math.min(18, zoom + 1))}
                      className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={loadSatelliteData}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2"
                    >
                      <span>🔄</span>
                      <span>Refresh</span>
                    </button>
                    {imageError && (
                      <button
                        onClick={() => {
                          setImageError(false)
                          // Reset to first source
                          const newUrl = earthEngineService.getSentinelImageUrl(coordinates, viewType, zoom)
                          setCurrentImageUrl(newUrl)
                          console.log('🔄 Resetting to primary image source')
                        }}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2"
                      >
                        <span>🛰️</span>
                        <span>Try Again</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Series Chart */}
              {timeSeriesData.length > 0 && (
                <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">📈 Vegetation Health Trend (6 Months)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" domain={[0, 1]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ndvi"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="NDVI"
                        dot={{ fill: '#10b981', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="evi"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="EVI"
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Analysis Panel */}
            <div className="space-y-6">
              {/* Health Score */}
              {analysis && (
                <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🌿 Vegetation Health</h3>
                  
                  <div className={`${getHealthBgColor(analysis.healthScore)} rounded-xl p-4 mb-4`}>
                    <div className={`text-5xl font-bold ${getHealthColor(analysis.healthScore)} mb-2`}>
                      {analysis.healthScore.toFixed(0)}%
                    </div>
                    <div className="text-white font-semibold">Overall Health Score</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">NDVI Index</span>
                      <span className="text-white font-bold">{analysis.ndvi.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">EVI Index</span>
                      <span className="text-white font-bold">{analysis.evi.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">Vegetation Density</span>
                      <span className="text-green-400 font-bold">{analysis.vegetationDensity}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">Water Presence</span>
                      <span className={analysis.waterPresence ? 'text-blue-400' : 'text-gray-400'}>
                        {analysis.waterPresence ? '✓ Detected' : '✗ None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Carbon Sequestration */}
              {carbonData && (
                <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">💚 Carbon Sequestration</h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="text-gray-300 text-sm mb-1">Annual Sequestration</div>
                      <div className="text-green-400 text-2xl font-bold">
                        {carbonData.annualSequestration.toFixed(2)} tons CO₂/year
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <div className="text-gray-300 text-sm">Total Carbon Stock</div>
                      <div className="text-white font-bold">{carbonData.totalStock.toFixed(0)} tons CO₂</div>
                    </div>
                    
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <div className="text-gray-300 text-sm">Credits Generated</div>
                      <div className="text-yellow-400 font-bold">{carbonData.creditsGenerated} credits</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Detection */}
              {analysis?.changeDetection && (
                <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🔍 Change Detection</h3>
                  
                  <div className="space-y-3">
                    {analysis.changeDetection.growth && (
                      <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📈</span>
                          <div>
                            <div className="text-green-400 font-semibold">Growth Detected</div>
                            <div className="text-gray-300 text-sm">
                              +{Math.abs(analysis.changeDetection.percentChange).toFixed(1)}% increase
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {analysis.changeDetection.deforestation && (
                      <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <div className="text-red-400 font-semibold">Deforestation Alert</div>
                            <div className="text-gray-300 text-sm">
                              -{Math.abs(analysis.changeDetection.percentChange).toFixed(1)}% decrease
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">ℹ️ Index Legend</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-white font-semibold mb-1">NDVI (Vegetation Index)</div>
                    <div className="text-gray-400">-1 to 1 scale</div>
                    <div className="text-gray-400">Higher = Healthier vegetation</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-1">EVI (Enhanced Index)</div>
                    <div className="text-gray-400">Optimized for high biomass</div>
                    <div className="text-gray-400">Better for dense forests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Earth Engine Setup Modal */}
      {showSetup && (
        <GoogleEarthEngineSetup
          onClose={() => {
            setShowSetup(false)
            // Refresh configuration status
            const status = googleEarthEngineService.getConfigurationStatus()
            setIsGoogleEarthEngineReady(status.ready)
          }}
        />
      )}
    </div>
  )
}

