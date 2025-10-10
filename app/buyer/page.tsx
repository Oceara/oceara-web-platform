'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const EarthWithProjects = dynamic(() => import('@/components/EarthWithProjects'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading Earth...</div>
})

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  const projects = [
    {
      id: 1,
      name: 'Sundarbans Mangrove Conservation',
      location: 'West Bengal, India',
      coordinates: { lat: 21.9497, lng: 88.8837 },
      area: '250 hectares',
      creditsAvailable: 1250,
      pricePerCredit: 25,
      verified: true,
      impact: '3,125 tons CO₂/year',
      image: '🌴',
      description: 'Largest mangrove forest restoration project in India'
    },
    {
      id: 2,
      name: 'Kerala Backwater Restoration',
      location: 'Kerala, India',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      area: '180 hectares',
      creditsAvailable: 890,
      pricePerCredit: 22,
      verified: true,
      impact: '2,225 tons CO₂/year',
      image: '🌊',
      description: 'Coastal ecosystem restoration in Kerala backwaters'
    },
    {
      id: 3,
      name: 'Andaman Islands Blue Carbon',
      location: 'Andaman & Nicobar, India',
      coordinates: { lat: 11.7401, lng: 92.6586 },
      area: '320 hectares',
      creditsAvailable: 1600,
      pricePerCredit: 28,
      verified: true,
      impact: '4,480 tons CO₂/year',
      image: '🏝️',
      description: 'Pristine mangrove conservation in Andaman Islands'
    },
    {
      id: 4,
      name: 'Gujarat Coastal Protection',
      location: 'Gujarat, India',
      coordinates: { lat: 21.5222, lng: 70.4579 },
      area: '200 hectares',
      creditsAvailable: 1000,
      pricePerCredit: 24,
      verified: true,
      impact: '2,500 tons CO₂/year',
      image: '🌅',
      description: 'Mangrove plantation for coastal protection'
    }
  ]

  const myCredits = [
    { project: 'Sundarbans Project', credits: 50, value: 1250, date: '2024-09-15' },
    { project: 'Kerala Restoration', credits: 30, value: 660, date: '2024-10-01' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🌊 Oceara - Carbon Credit Buyer</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-300 text-sm">My Credits</div>
              <div className="text-white font-bold">80 Credits</div>
            </div>
            <button className="px-6 py-2 bg-purple-500 rounded-full text-white hover:bg-purple-600">
              Profile
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['marketplace', 'globe', 'portfolio'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm">Location</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option>All India</option>
                    <option>West Bengal</option>
                    <option>Kerala</option>
                    <option>Gujarat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">Price Range</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option>All Prices</option>
                    <option>$20-25</option>
                    <option>$25-30</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">Verification</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option>Verified Only</option>
                    <option>All Projects</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">Sort By</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Impact: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{project.image}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{project.name}</h3>
                          <p className="text-gray-300 text-sm">📍 {project.location}</p>
                        </div>
                      </div>
                      {project.verified && (
                        <span className="px-3 py-1 bg-green-500 rounded-full text-sm text-white">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{project.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Area</div>
                        <div className="text-white font-semibold">{project.area}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">CO₂ Impact</div>
                        <div className="text-white font-semibold">{project.impact}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Available Credits</div>
                        <div className="text-white font-semibold">{project.creditsAvailable}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Price per Credit</div>
                        <div className="text-white font-semibold">${project.pricePerCredit}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-purple-500 rounded-full text-white font-semibold hover:bg-purple-600">
                        Buy Credits
                      </button>
                      <button className="px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20">
                        View on Map
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Globe Tab - Interactive Earth */}
        {activeTab === 'globe' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🌍 Global Mangrove Projects</h2>
              <p className="text-gray-300 mb-4">
                Explore verified mangrove conservation projects across India. Click on markers to view details.
              </p>
              <div className="h-[500px] bg-slate-900 rounded-xl overflow-hidden">
                <EarthWithProjects projects={projects} />
              </div>
            </div>

            {/* Project List Below Globe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 cursor-pointer hover:border-purple-500 transition-all"
                >
                  <div className="text-3xl mb-2">{project.image}</div>
                  <h4 className="text-white font-semibold mb-1">{project.name}</h4>
                  <p className="text-gray-400 text-sm">{project.location}</p>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-purple-400 font-semibold">{project.creditsAvailable} credits</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-3xl font-bold text-white">80</div>
                <div className="text-gray-300">Total Credits Owned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-3xl font-bold text-white">$1,910</div>
                <div className="text-gray-300">Portfolio Value</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-3xl font-bold text-white">200t</div>
                <div className="text-gray-300">CO₂ Offset</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">My Credit Holdings</h2>
              <div className="space-y-4">
                {myCredits.map((credit, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-semibold">{credit.project}</div>
                      <div className="text-gray-400 text-sm">Purchased: {credit.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{credit.credits} Credits</div>
                      <div className="text-purple-400">${credit.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

