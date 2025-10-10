'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  // Mock data for projects awaiting approval
  const pendingProjects = [
    {
      id: 1,
      name: 'Mumbai Coastal Mangrove',
      owner: 'Rajesh Kumar',
      location: 'Mumbai, Maharashtra',
      area: '150 hectares',
      submittedDate: '2024-10-05',
      status: 'Pending Review',
      images: ['📷', '📷', '📷'],
      gpsData: { lat: 19.0760, lng: 72.8777 },
      fieldData: {
        trees: 12500,
        species: 'Rhizophora mucronata',
        soilType: 'Muddy clay',
        waterSalinity: '25 ppt'
      },
      aiResults: {
        treeCount: 12450,
        healthScore: 87,
        carbonPotential: 625,
        confidence: 92
      },
      documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
    },
    {
      id: 2,
      name: 'Tamil Nadu Estuary Project',
      owner: 'Priya Sharma',
      location: 'Tamil Nadu',
      area: '200 hectares',
      submittedDate: '2024-10-08',
      status: 'Under Verification',
      images: ['📷', '📷'],
      gpsData: { lat: 11.1271, lng: 78.6569 },
      fieldData: {
        trees: 18000,
        species: 'Avicennia marina',
        soilType: 'Sandy loam',
        waterSalinity: '30 ppt'
      },
      aiResults: {
        treeCount: 17980,
        healthScore: 91,
        carbonPotential: 900,
        confidence: 95
      },
      documents: ['Land Deed', 'Survey Report']
    }
  ]

  const stats = [
    { label: 'Pending Approvals', value: '12', icon: '⏳', color: 'bg-yellow-500' },
    { label: 'Verified Projects', value: '48', icon: '✅', color: 'bg-green-500' },
    { label: 'Credits Minted', value: '125K', icon: '💰', color: 'bg-blue-500' },
    { label: 'Active Users', value: '234', icon: '👥', color: 'bg-purple-500' }
  ]

  const recentActivity = [
    { action: 'Project Approved', project: 'Sundarbans Project', user: 'Admin John', time: '10 mins ago', icon: '✅' },
    { action: 'Credits Minted', project: 'Kerala Restoration', amount: '890 credits', time: '1 hour ago', icon: '💰' },
    { action: 'New Submission', project: 'Gujarat Coastal', user: 'Amit Patel', time: '2 hours ago', icon: '📝' },
    { action: 'Data Verified', project: 'Andaman Project', user: 'Admin Sarah', time: '3 hours ago', icon: '🔍' }
  ]

  const blockchainTransactions = [
    { txHash: '0x1a2b3c...', action: 'Mint Credits', amount: '1,250', status: 'Confirmed', time: '2024-10-09 14:30' },
    { txHash: '0x4d5e6f...', action: 'Transfer Credits', amount: '500', status: 'Confirmed', time: '2024-10-09 13:15' },
    { txHash: '0x7g8h9i...', action: 'Mint Credits', amount: '890', status: 'Pending', time: '2024-10-09 12:00' }
  ]

  const handleApprove = (projectId: number) => {
    alert(`Project ${projectId} approved! Credits will be minted.`)
    // In real app: API call to approve and mint credits
  }

  const handleReject = (projectId: number, reason: string) => {
    alert(`Project ${projectId} rejected. Reason: ${reason}`)
    // In real app: API call to reject with reason
  }

  const handleManualOverride = (projectId: number, newValue: number) => {
    alert(`Manual override applied. New carbon value: ${newValue} tons`)
    // In real app: Update carbon calculation
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🌊 Oceara - Administrator</h1>
            <p className="text-gray-300 text-sm">Project Verification & Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-300 text-sm">Admin</div>
              <div className="text-white font-bold">John Doe</div>
            </div>
            <button className="px-6 py-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-600">
              Profile
            </button>
          </div>
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
              <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {['overview', 'approvals', 'verification', 'blockchain', 'reports', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white'
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
            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{activity.action}</div>
                      <div className="text-gray-300 text-sm">
                        {activity.project} {activity.user && `• ${activity.user}`} {activity.amount && `• ${activity.amount}`}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">⚡ Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:scale-105 transition-all">
                  <div className="text-3xl mb-2">📝</div>
                  Review Projects
                </button>
                <button className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:scale-105 transition-all">
                  <div className="text-3xl mb-2">✅</div>
                  Approve & Mint
                </button>
                <button className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white font-semibold hover:scale-105 transition-all">
                  <div className="text-3xl mb-2">🔗</div>
                  Blockchain View
                </button>
                <button className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white font-semibold hover:scale-105 transition-all">
                  <div className="text-3xl mb-2">📊</div>
                  Export Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project Approval Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📋 Projects Awaiting Approval</h2>
              <div className="space-y-4">
                {pendingProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                        <p className="text-gray-300">Owner: {project.owner}</p>
                        <p className="text-gray-400 text-sm">📍 {project.location}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        project.status === 'Pending Review' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Area</div>
                        <div className="text-white font-semibold">{project.area}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Submitted</div>
                        <div className="text-white font-semibold">{project.submittedDate}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">AI Confidence</div>
                        <div className="text-white font-semibold">{project.aiResults.confidence}%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Carbon Potential</div>
                        <div className="text-white font-semibold">{project.aiResults.carbonPotential}t</div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowModal(true)
                        }}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all"
                      >
                        🔍 Review Details
                      </button>
                      <button
                        onClick={() => handleApprove(project.id)}
                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
                      >
                        ✅ Approve & Mint
                      </button>
                      <button
                        onClick={() => handleReject(project.id, 'Incomplete documentation')}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-all"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Verification Tab */}
        {activeTab === 'verification' && selectedProject && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🔍 Data Verification</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Uploaded Images */}
              <div>
                <h3 className="text-white font-semibold mb-3">📷 Uploaded Images</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProject.images.map((img: string, i: number) => (
                    <div key={i} className="aspect-square bg-white/5 rounded-lg flex items-center justify-center text-4xl">
                      {img}
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS Data */}
              <div>
                <h3 className="text-white font-semibold mb-3">📍 GPS Data</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-300">Latitude: {selectedProject.gpsData.lat}</div>
                  <div className="text-gray-300">Longitude: {selectedProject.gpsData.lng}</div>
                  <button className="mt-3 px-4 py-2 bg-blue-500 rounded-lg text-white text-sm">
                    View on Map
                  </button>
                </div>
              </div>

              {/* Field Data */}
              <div>
                <h3 className="text-white font-semibold mb-3">📊 Field Data</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trees:</span>
                    <span className="text-white font-semibold">{selectedProject.fieldData.trees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Species:</span>
                    <span className="text-white font-semibold">{selectedProject.fieldData.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Soil Type:</span>
                    <span className="text-white font-semibold">{selectedProject.fieldData.soilType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Salinity:</span>
                    <span className="text-white font-semibold">{selectedProject.fieldData.waterSalinity}</span>
                  </div>
                </div>
              </div>

              {/* AI/ML Results */}
              <div>
                <h3 className="text-white font-semibold mb-3">🤖 AI/ML Analysis</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tree Count:</span>
                    <span className="text-white font-semibold">{selectedProject.aiResults.treeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Health Score:</span>
                    <span className="text-green-400 font-semibold">{selectedProject.aiResults.healthScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carbon Potential:</span>
                    <span className="text-blue-400 font-semibold">{selectedProject.aiResults.carbonPotential}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-purple-400 font-semibold">{selectedProject.aiResults.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Override */}
            <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">⚠️ Manual Override</h3>
              <p className="text-gray-300 text-sm mb-3">
                If AI results need adjustment based on expert review
              </p>
              <div className="flex gap-3">
                <input
                  type="number"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Enter adjusted carbon value (tons)"
                />
                <button
                  onClick={() => handleManualOverride(selectedProject.id, 650)}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold"
                >
                  Apply Override
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🔗 Blockchain Registry</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold p-3">Transaction Hash</th>
                    <th className="text-left text-white font-semibold p-3">Action</th>
                    <th className="text-left text-white font-semibold p-3">Amount</th>
                    <th className="text-left text-white font-semibold p-3">Status</th>
                    <th className="text-left text-white font-semibold p-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {blockchainTransactions.map((tx, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3 text-blue-400 font-mono text-sm">{tx.txHash}</td>
                      <td className="p-3 text-white">{tx.action}</td>
                      <td className="p-3 text-white font-semibold">{tx.amount}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          tx.status === 'Confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 text-sm">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Export Compliance Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="text-white font-semibold mb-2">Project Summary</h3>
                <p className="text-gray-400 text-sm mb-4">Complete list of all verified projects with statistics</p>
                <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold">
                  Export PDF
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-white font-semibold mb-2">Carbon Credits Report</h3>
                <p className="text-gray-400 text-sm mb-4">Credits minted, traded, and retired</p>
                <button className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold">
                  Export Excel
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="text-white font-semibold mb-2">Blockchain Audit</h3>
                <p className="text-gray-400 text-sm mb-4">Complete blockchain transaction history</p>
                <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold">
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📝 Audit Logs</h2>
            
            <div className="space-y-3">
              {[
                { user: 'Admin John', action: 'Approved project "Mumbai Coastal"', time: '2024-10-09 14:30:15', ip: '192.168.1.1' },
                { user: 'Admin Sarah', action: 'Rejected project "Invalid Site"', time: '2024-10-09 13:15:42', ip: '192.168.1.2' },
                { user: 'Admin John', action: 'Applied manual override on project ID #45', time: '2024-10-09 12:00:33', ip: '192.168.1.1' },
                { user: 'Admin Mike', action: 'Exported compliance report', time: '2024-10-09 11:45:18', ip: '192.168.1.3' },
                { user: 'Admin Sarah', action: 'Minted 1,250 carbon credits', time: '2024-10-09 10:30:27', ip: '192.168.1.2' }
              ].map((log, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl">👤</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-white font-semibold">{log.user}</div>
                      <div className="text-gray-500 text-xs">{log.time}</div>
                    </div>
                    <div className="text-gray-300 text-sm">{log.action}</div>
                    <div className="text-gray-500 text-xs mt-1">IP: {log.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white text-2xl hover:text-red-400"
              >
                ✕
              </button>
            </div>
            {/* Full project details here */}
            <div className="text-white">
              <p>Full project verification interface would go here...</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

