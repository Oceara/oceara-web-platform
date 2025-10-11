'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useData } from '@/context/DataContext'
import PurchaseModal from '@/components/PurchaseModal'
import BlockchainWallet from '@/components/BlockchainWallet'
import EarthEngineSatelliteViewer from '@/components/EarthEngineSatelliteViewer'

const EarthWithProjects = dynamic(() => import('@/components/EarthWithProjects'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading Earth...</div>
})

export default function BuyerDashboard() {
  const { projects, updateProject, getVerifiedProjects } = useData()
  const [activeTab, setActiveTab] = useState('marketplace')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEarthEngine, setShowEarthEngine] = useState(false)
  const [myPurchases, setMyPurchases] = useState<any[]>([])
  const [totalCreditsOwned, setTotalCreditsOwned] = useState(80)
  const [totalSpent, setTotalSpent] = useState(1910)

  // Get verified projects from context
  const verifiedProjects = getVerifiedProjects()

  const handlePurchase = (projectId: number, credits: number, totalCost: number) => {
    // Find the project
    const project = projects.find(p => p.id === projectId)
    if (project) {
      // Update project credits available
      updateProject(projectId, {
        creditsAvailable: project.creditsAvailable - credits
      })

      // Add to my purchases
      const newPurchase = {
        project: project.name,
        credits,
        value: totalCost,
        date: new Date().toISOString().split('T')[0]
      }
      setMyPurchases(prev => [...prev, newPurchase])
      
      // Update totals
      setTotalCreditsOwned(prev => prev + credits)
      setTotalSpent(prev => prev + totalCost)
      
      // Close modal
      setShowPurchaseModal(false)
      setSelectedProject(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              <span className="hidden sm:inline">🌊 Oceara - Carbon Credit Buyer</span>
              <span className="sm:hidden">🌊 Oceara Buyer</span>
            </h1>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-gray-300 text-xs sm:text-sm">My Credits</div>
                        <div className="text-white font-bold text-sm sm:text-base">{totalCreditsOwned}</div>
                      </div>
                      <BlockchainWallet />
                    </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['marketplace', 'globe', 'portfolio'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
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
              {verifiedProjects.map((project) => (
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
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowPurchaseModal(true)
                        }}
                        className="flex-1 py-3 bg-purple-500 rounded-full text-white font-semibold hover:bg-purple-600 transition-all"
                      >
                        💳 Buy Credits
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowEarthEngine(true)
                        }}
                        className="px-6 py-3 bg-green-600 rounded-full text-white hover:bg-green-700 transition-all"
                        title="Satellite Analysis"
                      >
                        🛰️
                      </button>
                      <button
                        onClick={() => {
                          const { lat, lng } = project.coordinates
                          window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15&t=k`, '_blank')
                        }}
                        className="px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                      >
                        🗺️
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
                <EarthWithProjects projects={verifiedProjects} />
              </div>
            </div>

            {/* Project List Below Globe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {verifiedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="text-3xl mb-2">{project.image}</div>
                  <h4 className="text-white font-semibold mb-1 text-sm">{project.name}</h4>
                  <p className="text-gray-400 text-xs mb-2">{project.location}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Available:</span>
                      <span className="text-purple-400 font-semibold">{project.creditsAvailable}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white font-semibold">${project.pricePerCredit}/credit</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowPurchaseModal(true)
                        }}
                        className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-xs font-semibold transition-all"
                      >
                        💳 Buy
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowEarthEngine(true)
                        }}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-xs transition-all"
                        title="View Satellite Analysis"
                      >
                        🛰️
                      </button>
                      <button
                        onClick={() => {
                          const { lat, lng } = project.coordinates
                          window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15&t=k`, '_blank')
                        }}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-all"
                      >
                        🗺️
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                <div className="text-3xl font-bold text-white">{totalCreditsOwned}</div>
                <div className="text-gray-300">Total Credits Owned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-3xl font-bold text-white">${totalSpent.toLocaleString()}</div>
                <div className="text-gray-300">Total Invested</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-3xl font-bold text-white">{(totalCreditsOwned * 2.5).toFixed(0)}t</div>
                <div className="text-gray-300">CO₂ Offset</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">My Credit Holdings</h2>
              {myPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400">No purchases yet</p>
                  <p className="text-gray-500 text-sm">Start buying carbon credits to see your portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPurchases.map((credit, index) => (
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
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProject && (
        <PurchaseModal
          project={selectedProject}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedProject(null)
          }}
          onPurchase={handlePurchase}
        />
      )}

      {/* Earth Engine Satellite Viewer */}
      {showEarthEngine && selectedProject && (
        <EarthEngineSatelliteViewer
          coordinates={selectedProject.coordinates}
          projectName={selectedProject.name}
          area={parseFloat(selectedProject.area) || 10}
          onClose={() => {
            setShowEarthEngine(false)
            setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
}

