'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ImageVerificationPanelProps {
  project: any
  onVerify: (imageId: number, status: 'approved' | 'rejected', notes: string) => void
}

export default function ImageVerificationPanel({ project, onVerify }: ImageVerificationPanelProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [notes, setNotes] = useState('')
  const [showComparison, setShowComparison] = useState(false)

  // Mock satellite images
  const images = [
    {
      id: 1,
      type: 'satellite',
      url: `https://maps.googleapis.com/maps/api/staticmap?center=${project.gpsData?.lat || 21.9497},${project.gpsData?.lng || 88.8837}&zoom=16&size=800x600&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      timestamp: '2024-10-05 10:30 AM',
      resolution: 'High (0.5m)',
      status: 'pending'
    },
    {
      id: 2,
      type: 'satellite',
      url: `https://maps.googleapis.com/maps/api/staticmap?center=${project.gpsData?.lat || 21.9497},${project.gpsData?.lng || 88.8837}&zoom=17&size=800x600&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      timestamp: '2024-10-05 10:32 AM',
      resolution: 'High (0.5m)',
      status: 'pending'
    },
    {
      id: 3,
      type: 'uploaded',
      url: `https://maps.googleapis.com/maps/api/staticmap?center=${project.gpsData?.lat || 21.9497},${project.gpsData?.lng || 88.8837}&zoom=18&size=800x600&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      timestamp: '2024-10-05 02:15 PM',
      resolution: 'Field Photo',
      status: 'pending'
    }
  ]

  const mlDetections = {
    mangroveArea: 245.7,
    treeCount: 12450,
    healthScore: 87,
    speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
    canopyCoverage: 78.5,
    waterBodies: 15.2,
    confidence: 92
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 rounded-xl overflow-hidden border border-white/20">
            <div className="relative aspect-video bg-slate-800">
              <img
                src={images[selectedImage].url}
                alt={`Verification ${selectedImage + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              
              {/* ML Overlay Annotations */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Mangroves Detected
                </div>
                <div className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {mlDetections.treeCount.toLocaleString()} Trees
                </div>
                <div className="bg-purple-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {mlDetections.confidence}% Confidence
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                  className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center font-bold text-gray-800"
                >
                  −
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-4 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center font-semibold text-gray-800 text-sm"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                  className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center font-bold text-gray-800"
                >
                  +
                </button>
              </div>
            </div>

            {/* Image Info */}
            <div className="p-4 bg-white/5">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-400">Type: </span>
                  <span className="text-white font-semibold capitalize">{images[selectedImage].type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Resolution: </span>
                  <span className="text-white font-semibold">{images[selectedImage].resolution}</span>
                </div>
                <div>
                  <span className="text-gray-400">Timestamp: </span>
                  <span className="text-white font-semibold">{images[selectedImage].timestamp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-semibold">
                    {img.type === 'satellite' ? '🛰️' : '📷'} {idx + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Verification Actions */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">Verification Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
              placeholder="Add notes about this image verification..."
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => onVerify(images[selectedImage].id, 'approved', notes)}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
              >
                ✓ Approve Image
              </button>
              <button
                onClick={() => onVerify(images[selectedImage].id, 'rejected', notes)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-all"
              >
                ✕ Reject Image
              </button>
            </div>
          </div>
        </div>

        {/* ML Analysis Panel */}
        <div className="space-y-4">
          {/* Detection Summary */}
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🤖</span>
              <span>ML Detection Results</span>
            </h3>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Mangrove Area</div>
                <div className="text-2xl font-bold text-white">{mlDetections.mangroveArea} ha</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Tree Count</div>
                <div className="text-2xl font-bold text-white">{mlDetections.treeCount.toLocaleString()}</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Health Score</div>
                <div className="text-2xl font-bold text-white">{mlDetections.healthScore}%</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${mlDetections.healthScore}%` }} />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Model Confidence</div>
                <div className="text-2xl font-bold text-white">{mlDetections.confidence}%</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${mlDetections.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Species Detected */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">🌿 Species Detected</h3>
            <div className="space-y-2">
              {mlDetections.speciesDetected.map((species, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-white text-sm italic">{species}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Land Cover Analysis */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">📊 Land Cover</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Canopy Coverage</span>
                  <span className="text-white font-semibold">{mlDetections.canopyCoverage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${mlDetections.canopyCoverage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Water Bodies</span>
                  <span className="text-white font-semibold">{mlDetections.waterBodies}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${mlDetections.waterBodies}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Tool */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">🔍 Analysis Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold text-sm transition-all"
              >
                {showComparison ? 'Hide' : 'Show'} Historical Comparison
              </button>
              <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold text-sm transition-all">
                View Heat Map
              </button>
              <button className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold text-sm transition-all">
                Download Analysis Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Comparison */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-white font-semibold mb-4">📈 Historical Analysis (6 months)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Mangrove Growth</div>
              <div className="text-green-400 text-2xl font-bold">+12.5%</div>
              <div className="text-gray-500 text-xs mt-1">↑ 28.3 hectares</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Tree Increase</div>
              <div className="text-blue-400 text-2xl font-bold">+1,450</div>
              <div className="text-gray-500 text-xs mt-1">↑ New saplings detected</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Health Improvement</div>
              <div className="text-yellow-400 text-2xl font-bold">+5 pts</div>
              <div className="text-gray-500 text-xs mt-1">↑ Better canopy density</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

