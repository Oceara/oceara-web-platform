'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '@/context/DataContext'
import Link from 'next/link'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { projects, updateProject, getPendingProjects, getVerifiedProjects } = useData()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('all')

  const pendingProjects = getPendingProjects()
  const verifiedProjects = getVerifiedProjects()
  
  const stats = [
    { 
      label: 'Pending Approvals', 
      value: pendingProjects.length.toString(), 
      icon: '⏳', 
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      label: 'Verified Projects', 
      value: verifiedProjects.length.toString(), 
      icon: '✅', 
      color: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Credits Minted', 
      value: `${(verifiedProjects.reduce((acc, p) => acc + (p.mlAnalysis?.carbonCredits || 0), 0) / 1000).toFixed(1)}K`, 
      icon: '💰', 
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Total Area', 
      value: `${verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(0)} ha`, 
      icon: '🌍', 
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const handleApprove = (projectId: number) => {
    updateProject(projectId, {
      status: 'Active',
      verified: true
    })
    setShowModal(false)
    setSelectedProject(null)
  }

  const handleReject = (projectId: number) => {
    updateProject(projectId, {
      status: 'Rejected',
      verified: false
    })
    setShowModal(false)
    setSelectedProject(null)
  }

  const getFilteredProjects = () => {
    if (filterStatus === 'pending') {
      return pendingProjects
    }
    if (filterStatus === 'verified') {
      return verifiedProjects
    }
    return [...pendingProjects, ...verifiedProjects]
  }

  const filteredProjects = getFilteredProjects()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                🌊 Oceara - Administrator
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm">Project Verification & Management</p>
            </div>
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              🏠 Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20"
            >
              <div className={`text-2xl sm:text-4xl mb-2 sm:mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'approval', 'blockchain', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'approval' && '✅ Approval'}
              {tab === 'blockchain' && '⛓️ Blockchain'}
              {tab === 'reports' && '📄 Reports'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Status Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Verified', value: verifiedProjects.length, color: '#10b981' },
                        { name: 'Pending', value: pendingProjects.length, color: '#f59e0b' },
                        { name: 'Total', value: projects.length - verifiedProjects.length - pendingProjects.length || 1, color: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Verified', value: verifiedProjects.length, color: '#10b981' },
                        { name: 'Pending', value: pendingProjects.length, color: '#f59e0b' },
                        { name: 'Total', value: projects.length - verifiedProjects.length - pendingProjects.length || 1, color: '#6b7280' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Carbon Credits Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">💰 Carbon Credits by Region</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { region: 'West Bengal', credits: verifiedProjects.filter(p => p.location.includes('West Bengal')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Odisha', credits: verifiedProjects.filter(p => p.location.includes('Odisha')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Tamil Nadu', credits: verifiedProjects.filter(p => p.location.includes('Tamil Nadu')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Kerala', credits: verifiedProjects.filter(p => p.location.includes('Kerala')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Others', credits: verifiedProjects.filter(p => !p.location.includes('West Bengal') && !p.location.includes('Odisha') && !p.location.includes('Tamil Nadu') && !p.location.includes('Kerala')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="region" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="credits" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ML Confidence Trends */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🤖 ML Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { range: '80-85%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 80 && p.mlAnalysis.confidence < 85).length },
                    { range: '85-90%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 85 && p.mlAnalysis.confidence < 90).length },
                    { range: '90-95%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 90 && p.mlAnalysis.confidence < 95).length },
                    { range: '95-100%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 95).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Health Score Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🌱 Ecosystem Health Scores</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={projects.filter(p => p.mlAnalysis).slice(0, 10).map((p, i) => ({
                    name: `Project ${i + 1}`,
                    health: p.mlAnalysis?.healthScore || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">📈 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Projects Verified</span>
                    <span className="text-green-400 font-bold">{verifiedProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Awaiting Review</span>
                    <span className="text-yellow-400 font-bold">{pendingProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Credits</span>
                    <span className="text-blue-400 font-bold">{verifiedProjects.reduce((acc, p) => acc + (p.creditsAvailable || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Area</span>
                    <span className="text-purple-400 font-bold">{verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(0)} ha</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">🔬 ML Analysis Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Avg Confidence</span>
                    <span className="text-blue-400 font-bold">
                      {(projects.reduce((acc, p) => acc + (p.mlAnalysis?.confidence || 0), 0) / projects.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Avg Health Score</span>
                    <span className="text-green-400 font-bold">
                      {(projects.reduce((acc, p) => acc + (p.mlAnalysis?.healthScore || 0), 0) / projects.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Trees</span>
                    <span className="text-emerald-400 font-bold">
                      {projects.reduce((acc, p) => acc + (p.mlAnalysis?.treeCount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Species Detected</span>
                    <span className="text-teal-400 font-bold">
                      {[...new Set(projects.flatMap(p => p.mlAnalysis?.speciesDetected || []))].length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">⚙️ System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Blockchain</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Online</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">ML Analysis</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Ready</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Database</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Connected</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">API</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-2">
              {['all', 'pending', 'verified'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({
                    status === 'all' ? projects.length :
                    status === 'pending' ? pendingProjects.length :
                    verifiedProjects.length
                  })
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{project.image}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.verified 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{project.location}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Area:</span>
                      <span className="text-white font-semibold">{project.area}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Credits:</span>
                      <span className="text-purple-400 font-semibold">{project.creditsAvailable}</span>
                    </div>
                    {project.mlAnalysis && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">ML Confidence:</span>
                        <span className="text-blue-400 font-semibold">{project.mlAnalysis.confidence}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project)
                        setShowModal(true)
                      }}
                      className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold transition-all"
                    >
                      📋 View Details
                    </button>
                    {!project.verified && (
                      <button
                        onClick={() => handleApprove(project.id)}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm transition-all"
                      >
                        ✅
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">⛓️ Blockchain Registry</h2>
            <div className="space-y-4">
              {verifiedProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{project.name}</h3>
                      <p className="text-gray-400 text-sm">Credits: {project.creditsAvailable}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                      On-Chain
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📄 Export Reports</h2>
              <p className="text-gray-300 mb-6">Download comprehensive reports for compliance and analysis</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Project Report */}
                <button 
                  onClick={() => {
                    const data = projects.map(p => ({
                      ID: p.id,
                      Name: p.name,
                      Owner: p.owner,
                      Location: p.location,
                      Area: p.area,
                      Status: p.status,
                      Verified: p.verified ? 'Yes' : 'No',
                      Credits: p.creditsAvailable,
                      'Submitted Date': p.submittedDate,
                      'Health Score': p.mlAnalysis?.healthScore || 'N/A',
                      'ML Confidence': p.mlAnalysis?.confidence ? `${p.mlAnalysis.confidence}%` : 'N/A'
                    }))
                    const csv = [
                      Object.keys(data[0]).join(','),
                      ...data.map(row => Object.values(row).join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-projects-report-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Project report downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-xl text-left transition-all border border-blue-500/30"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-white font-semibold mb-1">Project Report</h3>
                  <p className="text-gray-300 text-sm mb-3">Export all project data (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{projects.length} projects</span>
                    <span className="text-blue-400 text-sm">⬇ Download</span>
                  </div>
                </button>

                {/* Credits Report */}
                <button 
                  onClick={() => {
                    const verifiedOnly = verifiedProjects
                    const data = verifiedOnly.map(p => ({
                      Project: p.name,
                      Location: p.location,
                      'Credits Available': p.creditsAvailable,
                      'Price Per Credit': `$${p.pricePerCredit}`,
                      'Total Value': `$${p.creditsAvailable * p.pricePerCredit}`,
                      Impact: p.impact,
                      Status: p.status
                    }))
                    const csv = [
                      Object.keys(data[0]).join(','),
                      ...data.map(row => Object.values(row).join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-credits-report-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Credits report downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl text-left transition-all border border-green-500/30"
                >
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="text-white font-semibold mb-1">Credits Report</h3>
                  <p className="text-gray-300 text-sm mb-3">Export carbon credits data (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{verifiedProjects.reduce((acc, p) => acc + p.creditsAvailable, 0).toLocaleString()} credits</span>
                    <span className="text-green-400 text-sm">⬇ Download</span>
                  </div>
                </button>

                {/* Analytics Report */}
                <button 
                  onClick={() => {
                    const stats = {
                      'Report Generated': new Date().toLocaleString(),
                      'Total Projects': projects.length,
                      'Verified Projects': verifiedProjects.length,
                      'Pending Projects': pendingProjects.length,
                      'Total Carbon Credits': verifiedProjects.reduce((acc, p) => acc + p.creditsAvailable, 0),
                      'Total Area (hectares)': verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(2),
                      'Average ML Confidence': `${(projects.reduce((acc, p) => acc + (p.mlAnalysis?.confidence || 0), 0) / projects.length).toFixed(1)}%`,
                      'Average Health Score': (projects.reduce((acc, p) => acc + (p.mlAnalysis?.healthScore || 0), 0) / projects.length).toFixed(1),
                      'Total Trees': projects.reduce((acc, p) => acc + (p.mlAnalysis?.treeCount || 0), 0),
                      'Unique Species': [...new Set(projects.flatMap(p => p.mlAnalysis?.speciesDetected || []))].length,
                      'Total Impact (CO₂/year)': verifiedProjects.reduce((acc, p) => acc + parseFloat(p.impact.split(' ')[0].replace(',', '')), 0).toFixed(0) + ' tons'
                    }
                    const csv = Object.entries(stats).map(([key, value]) => `${key},${value}`).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-analytics-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Analytics report downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl text-left transition-all border border-purple-500/30"
                >
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="text-white font-semibold mb-1">Analytics Report</h3>
                  <p className="text-gray-300 text-sm mb-3">Export platform analytics (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">11 key metrics</span>
                    <span className="text-purple-400 text-sm">⬇ Download</span>
                  </div>
                </button>

                {/* Audit Log */}
                <button 
                  onClick={() => {
                    const auditData = projects.map(p => ({
                      'Project ID': p.id,
                      'Project Name': p.name,
                      Action: p.verified ? 'Approved' : 'Pending Review',
                      'Submitted Date': p.submittedDate,
                      Status: p.status,
                      'Verification Status': p.verified ? 'Verified' : 'Unverified',
                      Documents: p.documents?.length || 0,
                      'ML Analysis': p.mlAnalysis ? 'Completed' : 'Pending'
                    }))
                    const csv = [
                      Object.keys(auditData[0]).join(','),
                      ...auditData.map(row => Object.values(row).join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-audit-log-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Audit log downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-xl text-left transition-all border border-orange-500/30"
                >
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="text-white font-semibold mb-1">Audit Log</h3>
                  <p className="text-gray-300 text-sm mb-3">Export audit trail (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{projects.length} entries</span>
                    <span className="text-orange-400 text-sm">⬇ Download</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📋 Recent Activity</h3>
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{project.image}</span>
                      <div>
                        <p className="text-white font-semibold">{project.name}</p>
                        <p className="text-gray-400 text-sm">{project.submittedDate}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.verified 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">📍 Location</h3>
                <p className="text-gray-300">{selectedProject.location}</p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">📊 ML Analysis</h3>
                {selectedProject.mlAnalysis && (
                  <div className="bg-white/5 rounded-lg p-4 space-y-2">
                    <p className="text-gray-300">Tree Count: {selectedProject.mlAnalysis.treeCount}</p>
                    <p className="text-gray-300">Area: {selectedProject.mlAnalysis.mangroveArea} ha</p>
                    <p className="text-gray-300">Health Score: {selectedProject.mlAnalysis.healthScore}/100</p>
                    <p className="text-gray-300">Confidence: {selectedProject.mlAnalysis.confidence}%</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">🌱 Field Data</h3>
                {selectedProject.fieldData && (
                  <div className="bg-white/5 rounded-lg p-4 space-y-2">
                    <p className="text-gray-300">Trees: {selectedProject.fieldData.trees}</p>
                    <p className="text-gray-300">Species: {selectedProject.fieldData.species}</p>
                    <p className="text-gray-300">Soil: {selectedProject.fieldData.soilType}</p>
                  </div>
                )}
              </div>

              {!selectedProject.verified && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(selectedProject.id)}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
                  >
                    ✅ Approve Project
                  </button>
                  <button
                    onClick={() => handleReject(selectedProject.id)}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-all"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
