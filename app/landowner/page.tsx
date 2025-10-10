'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import GoogleMapsPicker from '@/components/GoogleMapsPicker'
import MLAnalysisDisplay from '@/components/MLAnalysisDisplay'
import { useData } from '@/context/DataContext'
import BlockchainWallet from '@/components/BlockchainWallet'

const MapComponent = dynamic(() => import('@/components/GoogleMapsPicker'), {
  ssr: false,
  loading: () => <div className="text-white text-center py-12">Loading Google Maps...</div>
})

export default function LandownerDashboard() {
  const { getProjectsByOwner } = useData()
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState<'upload' | 'map' | null>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Get landowner's projects (Demo Landowner)
  const myProjects = getProjectsByOwner('Demo Landowner')

  // Calculate dynamic stats from user's projects
  const stats = [
    { 
      label: 'Total Area', 
      value: `${myProjects.reduce((acc, p) => acc + parseFloat(p.area.replace(/[^0-9.]/g, '')), 0).toFixed(0)} ha`, 
      icon: '🌴' 
    },
    { 
      label: 'Carbon Credits', 
      value: myProjects.reduce((acc, p) => acc + p.creditsAvailable, 0).toLocaleString(), 
      icon: '💰' 
    },
    { 
      label: 'Monthly Income', 
      value: `$${(myProjects.reduce((acc, p) => acc + (p.creditsAvailable * p.pricePerCredit), 0) * 0.15).toLocaleString()}`, 
      icon: '📈' 
    },
    { 
      label: 'Projects', 
      value: myProjects.length.toString(), 
      icon: '📊' 
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Verified':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Under Verification':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Pending Review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleViewDetails = (project: any) => {
    setSelectedProject(project)
    setShowProjectDetails(true)
  }

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
              <BlockchainWallet />
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
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'myprojects', label: 'My Projects', icon: '🌴', badge: myProjects.length },
            { id: 'register', label: 'Register New', icon: '➕' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setRegistrationMethod(null)
                setAnalysisData(null)
              }}
              className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
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

        {/* My Projects Tab - Enhanced */}
        {activeTab === 'myprojects' && (
          <div className="space-y-6">
            {/* Filter and Summary */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">My Projects</h2>
                  <p className="text-gray-300">Managing {myProjects.length} mangrove conservation projects</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all text-sm">
                    All ({myProjects.length})
                  </button>
                  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-all text-sm">
                    Active ({myProjects.filter(p => p.status === 'Active' || p.status === 'Verified').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            {myProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-blue-500/50 transition-all"
                  >
                    {/* Status Bar */}
                    <div className={`h-2 ${
                      project.status === 'Active' || project.status === 'Verified'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : project.status === 'Under Verification'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`} />

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{project.image || '🌴'}</div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                            <p className="text-gray-300 text-sm flex items-center gap-1">
                              <span>📍</span>
                              {project.location}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-gray-400 text-xs mb-1">Area</div>
                          <div className="text-white font-bold">{project.area}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-gray-400 text-xs mb-1">Credits</div>
                          <div className="text-green-400 font-bold">{project.creditsAvailable}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-gray-400 text-xs mb-1">CO₂ Impact</div>
                          <div className="text-blue-400 font-bold text-sm">{project.impact}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-gray-400 text-xs mb-1">Revenue/mo</div>
                          <div className="text-purple-400 font-bold">
                            ${((project.creditsAvailable * project.pricePerCredit) * 0.15).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {/* ML Analysis Preview */}
                      {project.mlAnalysis && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-purple-300 text-xs mb-1">AI Analysis</div>
                              <div className="text-white font-semibold text-sm">
                                {project.mlAnalysis.treeCount.toLocaleString()} trees detected
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-purple-300 text-xs mb-1">Confidence</div>
                              <div className={`font-bold ${
                                project.mlAnalysis.confidence >= 90 ? 'text-green-400' :
                                project.mlAnalysis.confidence >= 70 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {project.mlAnalysis.confidence}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(project)}
                          className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <span>👁️</span>
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            const { lat, lng } = project.coordinates
                            window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15&t=k`, '_blank')
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                        >
                          🗺️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">🌴</div>
                <h3 className="text-white text-xl font-bold mb-2">No Projects Yet</h3>
                <p className="text-gray-400 mb-6">Start by registering your first mangrove conservation project</p>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full text-white font-semibold hover:shadow-xl transition-all"
                >
                  ➕ Register New Project
                </button>
              </div>
            )}
          </div>
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
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Revenue Analytics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Revenue Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${(myProjects.reduce((acc, p) => acc + (p.creditsAvailable * p.pricePerCredit), 0) * 0.15).toLocaleString()}
                  </div>
                  <div className="text-green-300">Monthly Revenue</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${((myProjects.reduce((acc, p) => acc + (p.creditsAvailable * p.pricePerCredit), 0) * 0.15) * 12).toLocaleString()}
                  </div>
                  <div className="text-blue-300">Annual Projection</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="text-4xl mb-2">🌱</div>
                  <div className="text-3xl font-bold text-white mb-1">+15%</div>
                  <div className="text-purple-300">Growth Rate</div>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🌍 Environmental Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">🌳</div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {myProjects.reduce((acc, p) => acc + (p.mlAnalysis?.treeCount || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-gray-300">Trees Protected</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-4/5" />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">☁️</div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {myProjects.reduce((acc, p) => {
                          const impact = parseFloat(p.impact.replace(/[^0-9.]/g, ''))
                          return acc + (isNaN(impact) ? 0 : impact)
                        }, 0).toFixed(0)}t
                      </div>
                      <div className="text-gray-300">CO₂ Sequestered/year</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-3/4" />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">🗺️</div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {myProjects.reduce((acc, p) => acc + parseFloat(p.area.replace(/[^0-9.]/g, '')), 0).toFixed(0)} ha
                      </div>
                      <div className="text-gray-300">Total Area</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-full" />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">🏆</div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {myProjects.reduce((acc, p) => acc + p.creditsAvailable, 0).toLocaleString()}
                      </div>
                      <div className="text-gray-300">Carbon Credits</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-5/6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Project Health */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🎯 Project Health Scores</h2>
              <div className="space-y-4">
                {myProjects.map((project) => (
                  <div key={project.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{project.image || '🌴'}</span>
                        <div>
                          <div className="text-white font-semibold">{project.name}</div>
                          <div className="text-gray-400 text-sm">{project.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          (project.mlAnalysis?.healthScore || 0) >= 90 ? 'text-green-400' :
                          (project.mlAnalysis?.healthScore || 0) >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {project.mlAnalysis?.healthScore || 0}%
                        </div>
                        <div className="text-gray-400 text-xs">Health Score</div>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          (project.mlAnalysis?.healthScore || 0) >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          (project.mlAnalysis?.healthScore || 0) >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${project.mlAnalysis?.healthScore || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {showProjectDetails && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowProjectDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 backdrop-blur-lg p-6 border-b border-white/20 z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{selectedProject.image || '🌴'}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedProject.name}</h2>
                      <p className="text-gray-300 flex items-center gap-2">
                        <span>📍</span>
                        {selectedProject.location}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProjectDetails(false)}
                    className="text-white hover:text-red-400 transition-colors text-3xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-gray-400 text-sm mb-1">Status</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-gray-400 text-sm mb-1">Area</div>
                    <div className="text-white font-bold text-lg">{selectedProject.area}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-gray-400 text-sm mb-1">Credits</div>
                    <div className="text-green-400 font-bold text-lg">{selectedProject.creditsAvailable}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-gray-400 text-sm mb-1">Price/Credit</div>
                    <div className="text-purple-400 font-bold text-lg">${selectedProject.pricePerCredit}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-bold text-lg mb-3">📝 Project Description</h3>
                  <p className="text-gray-300">{selectedProject.description}</p>
                </div>

                {/* ML Analysis */}
                {selectedProject.mlAnalysis && (
                  <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-white font-bold text-lg mb-4">🤖 AI/ML Analysis Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-purple-300 text-sm mb-1">Tree Count</div>
                        <div className="text-white font-bold text-xl">
                          {selectedProject.mlAnalysis.treeCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-300 text-sm mb-1">Area Analyzed</div>
                        <div className="text-white font-bold text-xl">
                          {selectedProject.mlAnalysis.mangroveArea} ha
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-300 text-sm mb-1">Health Score</div>
                        <div className={`font-bold text-xl ${
                          selectedProject.mlAnalysis.healthScore >= 90 ? 'text-green-400' :
                          selectedProject.mlAnalysis.healthScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {selectedProject.mlAnalysis.healthScore}%
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-300 text-sm mb-1">Carbon Credits</div>
                        <div className="text-white font-bold text-xl">
                          {selectedProject.mlAnalysis.carbonCredits.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-300 text-sm mb-1">AI Confidence</div>
                        <div className="text-white font-bold text-xl">
                          {selectedProject.mlAnalysis.confidence}%
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-300 text-sm mb-1">Species</div>
                        <div className="text-white font-bold text-sm">
                          {selectedProject.mlAnalysis.speciesDetected.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Data */}
                {selectedProject.fieldData && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-white font-bold text-lg mb-4">📊 Field Data</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Number of Trees</div>
                        <div className="text-white font-semibold">{selectedProject.fieldData.trees.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Primary Species</div>
                        <div className="text-white font-semibold">{selectedProject.fieldData.species}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Soil Type</div>
                        <div className="text-white font-semibold">{selectedProject.fieldData.soilType}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Water Salinity</div>
                        <div className="text-white font-semibold">{selectedProject.fieldData.waterSalinity}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const { lat, lng } = selectedProject.coordinates
                      window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15&t=k`, '_blank')
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:shadow-xl transition-all"
                  >
                    🗺️ View on Google Maps
                  </button>
                  <button
                    onClick={() => setShowProjectDetails(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

