'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '@/context/DataContext'

export default function AdminDashboard() {
  const { projects, updateProject, getPendingProjects, getVerifiedProjects } = useData()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('all')

  // Get pending and verified projects
  const pendingProjects = getPendingProjects()
  const verifiedProjects = getVerifiedProjects()
  
  const stats = [
    { 
      label: 'Pending Approvals', 
      value: pendingProjects.length.toString(), 
      icon: '⏳', 
      color: 'from-yellow-500 to-orange-500',
      trend: '+2 today',
      trendUp: true
    },
    { 
      label: 'Verified Projects', 
      value: verifiedProjects.length.toString(), 
      icon: '✅', 
      color: 'from-green-500 to-emerald-500',
      trend: '+5 this week',
      trendUp: true
    },
    { 
      label: 'Credits Minted', 
      value: `${(verifiedProjects.reduce((acc, p) => acc + (p.mlAnalysis?.carbonCredits || 0), 0) / 1000).toFixed(1)}K`, 
      icon: '💰', 
      color: 'from-blue-500 to-cyan-500',
      trend: '+12% growth',
      trendUp: true
    },
    { 
      label: 'Total Area', 
      value: `${verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(0)} ha`, 
      icon: '🌍', 
      color: 'from-purple-500 to-pink-500',
      trend: 'Verified',
      trendUp: true
    }
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

  const handleApprove = (projectId: number, carbonCredits: number) => {
    updateProject(projectId, {
      status: 'Verified',
      verified: true,
      creditsAvailable: carbonCredits
    });
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleReject = (projectId: number, reason: string) => {
    updateProject(projectId, {
      status: 'Rejected',
      verified: false
    });
    setShowModal(false);
    setSelectedProject(null);
  };

  let filteredProjects = [...pendingProjects, ...verifiedProjects];
  if (filterStatus === 'pending') {
    filteredProjects = pendingProjects;
  } else if (filterStatus === 'verified') {
    filteredProjects = verifiedProjects;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                <span className="hidden sm:inline">🌊 Oceara - Administrator</span>
                <span className="sm:hidden">🌊 Admin</span>
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm hidden sm:block">Project Verification & Management</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-gray-300 text-xs sm:text-sm">Admin</div>
                <div className="text-white font-bold text-sm">John Doe</div>
              </div>
              <button className="px-3 sm:px-6 py-1.5 sm:py-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-600 text-sm sm:text-base">
                Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all group"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className={`text-xs font-semibold ${stat.trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1 justify-end`}>
                      {stat.trendUp ? '↗' : '↘'} {stat.trend}
                    </div>
                  </div>
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs - Enhanced with Icons */}
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'approvals', label: 'Approvals', icon: '✅', badge: pendingProjects.length },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'blockchain', label: 'Blockchain', icon: '🔗' },
            { id: 'reports', label: 'Reports', icon: '📄' },
            { id: 'audit', label: 'Audit Log', icon: '📝' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
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
            {/* Filter Bar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">📋 Project Management</h2>
                  <p className="text-gray-400 text-sm">{filteredProjects.length} projects • {pendingProjects.length} pending review</p>
                </div>
                <div className="flex gap-2">
                  {(['all', 'pending', 'verified'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        filterStatus === status
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {filteredProjects.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-white text-xl font-bold mb-2">No Projects Found</h3>
                  <p className="text-gray-400">All projects in this category have been processed</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-500/50 transition-all group overflow-hidden"
                  >
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      project.status === 'Verified' || project.status === 'Active' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : project.status === 'Rejected'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`} />

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="text-4xl">{project.image || '🌴'}</div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                            <p className="text-gray-300 text-sm">Owner: <span className="font-semibold">{project.owner}</span></p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                              <span>📍</span>
                              {project.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold text-center whitespace-nowrap ${
                          project.status === 'Verified' || project.status === 'Active'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : project.status === 'Rejected'
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        }`}>
                          {project.status}
                        </span>
                        {project.verified && (
                          <span className="text-center text-green-400 text-xs font-semibold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="text-gray-400 text-xs mb-1">Total Area</div>
                        <div className="text-white font-bold text-lg">{project.area}</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="text-gray-400 text-xs mb-1">Submitted</div>
                        <div className="text-white font-bold text-lg">{project.submittedDate}</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="text-gray-400 text-xs mb-1">AI Confidence</div>
                        <div className={`font-bold text-lg ${
                          (project.mlAnalysis?.confidence || 0) >= 90 ? 'text-green-400' : 
                          (project.mlAnalysis?.confidence || 0) >= 70 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {project.mlAnalysis?.confidence || 0}%
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="text-gray-400 text-xs mb-1">Carbon Credits</div>
                        <div className="text-blue-400 font-bold text-lg">{project.mlAnalysis?.carbonCredits || 0}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowModal(true)
                        }}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <span>🔍</span>
                        <span>Review Details</span>
                      </button>
                      {(project.status === 'Pending Review' || project.status === 'Under Verification') && (
                        <>
                          <button
                            onClick={() => handleApprove(project.id, project.mlAnalysis?.carbonCredits || 0)}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <span>✅</span>
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(project.id, 'Requires additional documentation')}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <span>❌</span>
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
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

