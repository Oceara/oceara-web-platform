'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LandownerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🌊 Oceara - Landowner</h1>
          <button className="px-6 py-2 bg-blue-500 rounded-full text-white hover:bg-blue-600">
            Profile
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
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
        <div className="flex gap-4 mb-6">
          {['overview', 'map', 'upload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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

        {/* Map Tab */}
        {activeTab === 'map' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Your Mangrove Locations</h2>
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Register New Mangrove Site</h2>
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
                <label className="block text-white mb-2">Upload Images</label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-300">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                </div>
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
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full text-white font-bold text-lg hover:shadow-2xl transition-all"
              >
                Submit for Verification
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

