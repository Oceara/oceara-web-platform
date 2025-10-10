'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import GoogleMapsPicker from '@/components/GoogleMapsPicker'
import MLAnalysisDisplay from '@/components/MLAnalysisDisplay'

const MapComponent = dynamic(() => import('@/components/GoogleMapsPicker'), {
  ssr: false,
  loading: () => <div className="text-white text-center py-12">Loading Google Maps...</div>
})

export default function LandownerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState<'upload' | 'map' | null>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ecosystems = [
    {
      id: 1,
      name: 'Sundarbans Mangrove Project',
      location: 'West Bengal, India',
      area: '250 hectares',
      status: 'Active',
      carbonCredits: 1250,
      coordinates: { lat: 21.9497, lng: 88.8837 }
    },
    {
      id: 2,
      name: 'Kerala Backwater Restoration',
      location: 'Kerala, India',
      area: '180 hectares',
      status: 'Pending Verification',
      carbonCredits: 890,
      coordinates: { lat: 9.9312, lng: 76.2673 }
    }
  ]

  const stats = [
    { label: 'Total Area', value: '430 ha', icon: '🌴' },
    { label: 'Carbon Credits', value: '2,140', icon: '💰' },
    { label: 'Monthly Income', value: '$8,560', icon: '📈' },
    { label: 'Projects', value: '2', icon: '📊' }
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setUploadedImages(prev => [...prev, ...newFiles])
      
      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      )
      
      setUploadedImages(prev => [...prev, ...newFiles])
      
      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleManualSubmit = () => {
    // Simulate AI analysis with uploaded images
    setAnalysisData({
      coordinates: { lat: 19.0760, lng: 72.8777 },
      area: 125,
      satelliteImages: imagePreviews.length > 0 ? imagePreviews : [
        'https://via.placeholder.com/800x600/0ea5e9/ffffff?text=Uploaded+Image+1',
        'https://via.placeholder.com/800x600/10b981/ffffff?text=Uploaded+Image+2',
        'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Uploaded+Image+3'
      ],
      mlAnalysis: {
        treeCount: 11250,
        mangroveArea: 125,
        healthScore: 89,
        speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
        carbonCredits: 575,
        confidence: 94
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              <span className="hidden sm:inline">🌊 Oceara - Landowner</span>
              <span className="sm:hidden">🌊 Oceara</span>
            </h1>
            <button className="px-3 sm:px-6 py-1.5 sm:py-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 text-sm sm:text-base">
              Profile
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {['overview', 'myprojects', 'register', 'map'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setRegistrationMethod(null)
                setAnalysisData(null)
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab === 'myprojects' ? 'My Projects' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ecosystems.map((eco) => (
              <motion.div
                key={eco.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{eco.name}</h3>
                    <p className="text-gray-300">📍 {eco.location}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm ${
                    eco.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {eco.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-gray-400 text-sm">Area</div>
                    <div className="text-white font-semibold">{eco.area}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Credits</div>
                    <div className="text-white font-semibold">{eco.carbonCredits}</div>
                  </div>
                </div>
                <button className="w-full py-3 bg-blue-500 rounded-full text-white font-semibold hover:bg-blue-600">
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* My Projects Tab */}
        {activeTab === 'myprojects' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Your Mangrove Locations</h2>
            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative mb-4">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9!2d88.8837!3d21.9497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDU2JzU4LjkiTiA4OMKwNTMnMDEuMyJF!5e0!3m2!1sen!2sin!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ecosystems.map((eco) => (
                <div key={eco.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl">📍</div>
                  <div>
                    <div className="text-white font-semibold">{eco.name}</div>
                    <div className="text-gray-400 text-sm">{eco.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && !registrationMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-4">Register New Mangrove Site</h2>
              <p className="text-gray-300 mb-8">Choose how you want to register your mangrove land</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option 1: Upload Photos */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setRegistrationMethod('upload')}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 rounded-2xl p-8 cursor-pointer hover:border-blue-400 transition-all"
                >
                  <div className="text-6xl mb-4 text-center">📷</div>
                  <h3 className="text-2xl font-bold text-white mb-3 text-center">Upload Photos</h3>
                  <p className="text-gray-300 text-center mb-4">
                    Have photos of your land? Upload them and we'll analyze them with AI
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Upload your own images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Manual GPS input</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>AI analysis of uploaded images</span>
                    </div>
                  </div>
                </motion.div>

                {/* Option 2: Point on Map */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setRegistrationMethod('map')}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-8 cursor-pointer hover:border-green-400 transition-all"
                >
                  <div className="text-6xl mb-4 text-center">🗺️</div>
                  <h3 className="text-2xl font-bold text-white mb-3 text-center">Point on Map</h3>
                  <p className="text-gray-300 text-center mb-4">
                    Don't have photos? Just point to your location and we'll fetch satellite imagery
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Automatic satellite imagery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>AI/ML analysis included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Instant carbon credit calculation</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Upload Form */}
        {activeTab === 'register' && registrationMethod === 'upload' && !analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setRegistrationMethod(null)}
                className="text-white hover:text-blue-400 text-2xl"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white">Upload Photos & Details</h2>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Project Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai Coastal Restoration"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Area (hectares)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">GPS Coordinates</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Latitude, Longitude"
                  />
                </div>
              </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-white mb-2 font-semibold">Upload Images</label>
                        
                        {/* Upload Zone */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                          <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB (Multiple images supported)</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="mt-4">
                            <p className="text-white text-sm mb-2 font-semibold">
                              {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} uploaded
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group aspect-square">
                                  <img
                                    src={preview}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border border-white/20"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeImage(index)
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center rounded-b-lg">
                                    {uploadedImages[index]?.name.substring(0, 20)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

              <div>
                <label className="block text-white mb-2">Project Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your mangrove restoration project..."
                />
              </div>

                      <button
                        type="button"
                        onClick={handleManualSubmit}
                        disabled={imagePreviews.length === 0}
                        className={`w-full py-4 rounded-full text-white font-bold text-lg transition-all ${
                          imagePreviews.length === 0
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-2xl'
                        }`}
                      >
                        {imagePreviews.length === 0 ? (
                          <>📷 Please upload images first</>
                        ) : (
                          <>🤖 Analyze {imagePreviews.length} Image{imagePreviews.length !== 1 ? 's' : ''} with AI</>
                        )}
                      </button>
                      
                      {imagePreviews.length === 0 && (
                        <p className="text-center text-gray-400 text-sm mt-2">
                          Upload at least one image to proceed with AI analysis
                        </p>
                      )}
            </form>
          </motion.div>
        )}

        {/* Map Location Picker */}
        {activeTab === 'register' && registrationMethod === 'map' && !analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setRegistrationMethod(null)}
                className="text-white hover:text-blue-400 text-2xl"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white">Select Location on Map</h2>
            </div>
            
            <MapComponent onLocationSelect={setAnalysisData} />
          </motion.div>
        )}

        {/* ML Analysis Results */}
        {activeTab === 'register' && analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setAnalysisData(null)
                  setRegistrationMethod(null)
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold"
              >
                ← Start New Registration
              </button>
            </div>
            
            <MLAnalysisDisplay data={analysisData} />
            
            <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Project Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Contact Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  alert('Project submitted for admin verification!')
                  setActiveTab('overview')
                  setAnalysisData(null)
                  setRegistrationMethod(null)
                }}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-bold text-lg hover:shadow-2xl transition-all"
              >
                ✅ Submit for Admin Verification
              </button>
            </div>
          </motion.div>
        )}

        {/* Map View Tab */}
        {activeTab === 'map' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Global Mangrove Map</h2>
            <p className="text-gray-300 mb-4">View mangrove forests around the world</p>
            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9!2d88.8837!3d21.9497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDU2JzU4LjkiTiA4OMKwNTMnMDEuMyJF!5e0!3m2!1sen!2sin!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

