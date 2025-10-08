'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhotoIcon,
  MapPinIcon,
  CogIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  BanknotesIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  // Mock data - in production, this would come from API
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        name: 'Mangrove Restoration - Sundarbans',
        owner: 'EcoForest Foundation',
        location: 'Sundarbans, West Bengal, India',
        area: 500,
        estimatedCarbon: 25000,
        status: 'pending_review',
        submittedDate: '2024-01-15',
        methodology: 'VCS VM0007',
        verificationStage: 'initial_review',
        documents: ['project_proposal.pdf', 'environmental_impact.pdf'],
        images: ['before_1.jpg', 'after_1.jpg', 'drone_survey.jpg'],
        gpsData: { lat: 22.1055, lng: 88.7519 },
        fieldData: 'soil_samples.csv',
        aiResults: {
          crownDetection: { confidence: 0.87, crownsDetected: 1250 },
          speciesClassification: { confidence: 0.92, species: 'Rhizophora mucronata' },
          healthAssessment: { confidence: 0.78, healthScore: 85 }
        }
      },
      {
        id: 2,
        name: 'Coastal Wetland Protection - Kerala',
        owner: 'Kerala Forest Department',
        location: 'Vembanad Lake, Kerala, India',
        area: 300,
        estimatedCarbon: 15000,
        status: 'under_verification',
        submittedDate: '2024-01-10',
        methodology: 'VCS VM0009',
        verificationStage: 'field_verification',
        documents: ['project_proposal.pdf', 'baseline_study.pdf'],
        images: ['wetland_1.jpg', 'wetland_2.jpg', 'satellite_imagery.jpg'],
        gpsData: { lat: 9.9312, lng: 76.2673 },
        fieldData: 'water_quality.csv',
        aiResults: {
          crownDetection: { confidence: 0.82, crownsDetected: 890 },
          speciesClassification: { confidence: 0.88, species: 'Avicennia marina' },
          healthAssessment: { confidence: 0.85, healthScore: 78 }
        }
      }
    ];

    const mockVerifications = [
      {
        id: 1,
        projectId: 1,
        verifier: 'Dr. Sarah Johnson',
        type: 'initial_review',
        status: 'completed',
        date: '2024-01-16',
        notes: 'Project documentation is complete and meets standards.',
        recommendations: ['Proceed to field verification', 'Additional soil testing required']
      },
      {
        id: 2,
        projectId: 2,
        verifier: 'Prof. Michael Chen',
        type: 'field_verification',
        status: 'in_progress',
        date: '2024-01-18',
        notes: 'Field visit scheduled for next week.',
        recommendations: []
      }
    ];

    const mockAuditLogs = [
      {
        id: 1,
        action: 'Project Approved',
        user: 'Admin User',
        timestamp: '2024-01-16T10:30:00Z',
        details: 'Project ID 1 approved for verification',
        ipAddress: '192.168.1.100'
      },
      {
        id: 2,
        action: 'AI Override',
        user: 'Admin User',
        timestamp: '2024-01-15T14:20:00Z',
        details: 'Manual override of species classification for Project ID 2',
        ipAddress: '192.168.1.100'
      }
    ];

    const mockTransactions = [
      {
        id: 1,
        type: 'Credit Minted',
        projectId: 1,
        amount: 1000,
        tokenId: '12345',
        txHash: '0x1234...5678',
        timestamp: '2024-01-16T11:00:00Z',
        status: 'confirmed'
      },
      {
        id: 2,
        type: 'Project Verified',
        projectId: 2,
        amount: 0,
        tokenId: null,
        txHash: '0x9876...5432',
        timestamp: '2024-01-15T16:30:00Z',
        status: 'confirmed'
      }
    ];

    setProjects(mockProjects);
    setVerifications(mockVerifications);
    setAuditLogs(mockAuditLogs);
    setBlockchainTransactions(mockTransactions);
    setIsLoading(false);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'projects', label: 'Projects', icon: DocumentTextIcon },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheckIcon },
    { id: 'ai-review', label: 'AI/ML Review', icon: CpuChipIcon },
    { id: 'blockchain', label: 'Blockchain', icon: BanknotesIcon },
    { id: 'audit', label: 'Audit Logs', icon: ClipboardDocumentListIcon },
    { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'text-yellow-400 bg-yellow-400/20';
      case 'under_verification': return 'text-blue-400 bg-blue-400/20';
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'in_progress': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return ClockIcon;
      case 'under_verification': return EyeIcon;
      case 'approved': return CheckCircleIcon;
      case 'rejected': return XCircleIcon;
      case 'completed': return CheckCircleIcon;
      case 'in_progress': return ClockIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  const handleProjectAction = (projectId: number, action: string) => {
    console.log(`Performing ${action} on project ${projectId}`);
    // Implement project action logic
  };

  const handleAIOverride = (projectId: number, field: string, newValue: any) => {
    console.log(`Overriding AI result for project ${projectId}, field ${field}:`, newValue);
    // Implement AI override logic
  };

  const exportReport = (type: string) => {
    console.log(`Exporting ${type} report`);
    // Implement export logic
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <ProtectedRoute requiredRole={ROLES.ADMIN}>
      <div className="min-h-screen bg-carbon-900">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 to-indigo-800 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Admin Dashboard
                </h1>
                <p className="text-xl text-purple-100 mb-8">
                  Manage projects, verify data, and oversee the carbon credit platform
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Quick Actions
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200"
                  >
                    System Status
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 bg-carbon-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[
                  { title: 'Pending Projects', value: projects.filter(p => p.status === 'pending_review').length, icon: ClockIcon, color: 'text-yellow-400' },
                  { title: 'Under Verification', value: projects.filter(p => p.status === 'under_verification').length, icon: EyeIcon, color: 'text-blue-400' },
                  { title: 'Approved Projects', value: projects.filter(p => p.status === 'approved').length, icon: CheckCircleIcon, color: 'text-green-400' },
                  { title: 'Total Credits Minted', value: '12,450', icon: BanknotesIcon, color: 'text-emerald-400' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6 text-center"
                  >
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-carbon-300 text-sm">{stat.title}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Tabs Section */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Tab Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex space-x-1 bg-carbon-800/50 p-1 rounded-lg overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-purple-500 text-white'
                          : 'text-carbon-300 hover:text-white hover:bg-carbon-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                  >
                    {/* Recent Activity */}
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        {auditLogs.slice(0, 5).map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 bg-carbon-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div>
                                <div className="text-white font-medium">{log.action}</div>
                                <div className="text-carbon-400 text-sm">{log.details}</div>
                              </div>
                            </div>
                            <div className="text-carbon-400 text-sm">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
                        <div className="space-y-3">
                          {[
                            { name: 'API Server', status: 'online', color: 'text-green-400' },
                            { name: 'Blockchain Network', status: 'connected', color: 'text-green-400' },
                            { name: 'AI/ML Models', status: 'active', color: 'text-green-400' },
                            { name: 'Database', status: 'online', color: 'text-green-400' }
                          ].map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <span className="text-carbon-300">{item.name}</span>
                              <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                            Approve Pending Projects
                          </button>
                          <button className="w-full border border-carbon-600 text-carbon-300 py-2 px-4 rounded-lg hover:bg-carbon-700 transition-colors">
                            Review AI Results
                          </button>
                          <button className="w-full border border-carbon-600 text-carbon-300 py-2 px-4 rounded-lg hover:bg-carbon-700 transition-colors">
                            Generate Reports
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'projects' && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    {/* Filters */}
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-400" />
                            <input
                              type="text"
                              placeholder="Search projects..."
                              value={filters.search}
                              onChange={(e) => setFilters({...filters, search: e.target.value})}
                              className="w-full pl-10 pr-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                          className="px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="all">All Status</option>
                          <option value="pending_review">Pending Review</option>
                          <option value="under_verification">Under Verification</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Projects List */}
                    <div className="space-y-4">
                      {filteredProjects.map((project) => {
                        const StatusIcon = getStatusIcon(project.status);
                        return (
                          <div
                            key={project.id}
                            className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-bold text-white">{project.name}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {project.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-carbon-300 mb-2">Owner: {project.owner}</p>
                                <p className="text-carbon-300 mb-2">Location: {project.location}</p>
                                <div className="flex items-center space-x-6 text-sm text-carbon-400">
                                  <span>Area: {project.area} hectares</span>
                                  <span>Carbon: {project.estimatedCarbon.toLocaleString()} tons</span>
                                  <span>Methodology: {project.methodology}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedProject(project)}
                                  className="p-2 text-carbon-400 hover:text-white hover:bg-carbon-700 rounded-lg transition-colors"
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleProjectAction(project.id, 'approve')}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleProjectAction(project.id, 'reject')}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {/* AI Results Summary */}
                            <div className="bg-carbon-700/50 rounded-lg p-4 mb-4">
                              <h4 className="text-white font-semibold mb-3">AI/ML Analysis Results</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-green-400 font-bold text-lg">
                                    {Math.round(project.aiResults.crownDetection.confidence * 100)}%
                                  </div>
                                  <div className="text-carbon-300 text-sm">Crown Detection</div>
                                  <div className="text-carbon-400 text-xs">
                                    {project.aiResults.crownDetection.crownsDetected} crowns
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-400 font-bold text-lg">
                                    {Math.round(project.aiResults.speciesClassification.confidence * 100)}%
                                  </div>
                                  <div className="text-carbon-300 text-sm">Species Classification</div>
                                  <div className="text-carbon-400 text-xs">
                                    {project.aiResults.speciesClassification.species}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-lg">
                                    {Math.round(project.aiResults.healthAssessment.confidence * 100)}%
                                  </div>
                                  <div className="text-carbon-300 text-sm">Health Assessment</div>
                                  <div className="text-carbon-400 text-xs">
                                    Score: {project.aiResults.healthAssessment.healthScore}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => setShowProjectModal(true)}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                              >
                                Review Details
                              </button>
                              <button
                                onClick={() => setShowVerificationModal(true)}
                                className="border border-carbon-600 text-carbon-300 px-4 py-2 rounded-lg hover:bg-carbon-700 transition-colors"
                              >
                                Verify Data
                              </button>
                              <button
                                onClick={() => handleProjectAction(project.id, 'mint')}
                                className="border border-green-600 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/10 transition-colors"
                              >
                                Mint Credits
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai-review' && (
                  <motion.div
                    key="ai-review"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-6">AI/ML Model Results Review</h3>
                      
                      {projects.map((project) => (
                        <div key={project.id} className="border border-carbon-600 rounded-lg p-6 mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">{project.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Crown Detection */}
                            <div className="bg-carbon-700/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-white font-medium">Crown Detection</h5>
                                <span className="text-green-400 text-sm font-medium">
                                  {Math.round(project.aiResults.crownDetection.confidence * 100)}% confidence
                                </span>
                              </div>
                              <div className="text-carbon-300 text-sm mb-3">
                                Detected: {project.aiResults.crownDetection.crownsDetected} crowns
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAIOverride(project.id, 'crownDetection', { confidence: 0.95, crownsDetected: 1300 })}
                                  className="flex-1 bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleAIOverride(project.id, 'crownDetection', { confidence: 0.75, crownsDetected: 1000 })}
                                  className="flex-1 border border-yellow-500 text-yellow-400 py-1 px-3 rounded text-xs hover:bg-yellow-500/10 transition-colors"
                                >
                                  Override
                                </button>
                              </div>
                            </div>

                            {/* Species Classification */}
                            <div className="bg-carbon-700/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-white font-medium">Species Classification</h5>
                                <span className="text-blue-400 text-sm font-medium">
                                  {Math.round(project.aiResults.speciesClassification.confidence * 100)}% confidence
                                </span>
                              </div>
                              <div className="text-carbon-300 text-sm mb-3">
                                Species: {project.aiResults.speciesClassification.species}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAIOverride(project.id, 'speciesClassification', { confidence: 0.95, species: 'Rhizophora mucronata' })}
                                  className="flex-1 bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleAIOverride(project.id, 'speciesClassification', { confidence: 0.85, species: 'Avicennia marina' })}
                                  className="flex-1 border border-yellow-500 text-yellow-400 py-1 px-3 rounded text-xs hover:bg-yellow-500/10 transition-colors"
                                >
                                  Override
                                </button>
                              </div>
                            </div>

                            {/* Health Assessment */}
                            <div className="bg-carbon-700/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-white font-medium">Health Assessment</h5>
                                <span className="text-purple-400 text-sm font-medium">
                                  {Math.round(project.aiResults.healthAssessment.confidence * 100)}% confidence
                                </span>
                              </div>
                              <div className="text-carbon-300 text-sm mb-3">
                                Health Score: {project.aiResults.healthAssessment.healthScore}/100
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAIOverride(project.id, 'healthAssessment', { confidence: 0.90, healthScore: 90 })}
                                  className="flex-1 bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleAIOverride(project.id, 'healthAssessment', { confidence: 0.80, healthScore: 75 })}
                                  className="flex-1 border border-yellow-500 text-yellow-400 py-1 px-3 rounded text-xs hover:bg-yellow-500/10 transition-colors"
                                >
                                  Override
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'blockchain' && (
                  <motion.div
                    key="blockchain"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-6">Blockchain Registry & Transaction History</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-carbon-700/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Type</th>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Project ID</th>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Amount</th>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Token ID</th>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Transaction Hash</th>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Status</th>
                              <th className="px-6 py-4 text-left text-carbon-300 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {blockchainTransactions.map((tx) => (
                              <tr key={tx.id} className="border-t border-carbon-700">
                                <td className="px-6 py-4 text-white">{tx.type}</td>
                                <td className="px-6 py-4 text-white">#{tx.projectId}</td>
                                <td className="px-6 py-4 text-white">{tx.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-white">{tx.tokenId || '-'}</td>
                                <td className="px-6 py-4 text-white font-mono text-sm">
                                  <a href={`https://polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                    {tx.txHash}
                                  </a>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-carbon-300">
                                  {new Date(tx.timestamp).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'audit' && (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-6">Audit Logs</h3>
                      
                      <div className="space-y-4">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="bg-carbon-700/50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-white font-medium">{log.action}</h4>
                                  <span className="text-carbon-400 text-sm">by {log.user}</span>
                                </div>
                                <p className="text-carbon-300 text-sm mb-2">{log.details}</p>
                                <div className="flex items-center space-x-4 text-xs text-carbon-400">
                                  <span>IP: {log.ipAddress}</span>
                                  <span>Time: {new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reports' && (
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-6">Export Tools & Regulatory Compliance Reports</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: 'Project Verification Report', description: 'Complete project verification details', type: 'verification' },
                          { title: 'Carbon Credit Registry', description: 'All issued carbon credits', type: 'registry' },
                          { title: 'Audit Trail Report', description: 'Complete audit log for compliance', type: 'audit' },
                          { title: 'AI/ML Analysis Report', description: 'AI model results and overrides', type: 'ai' },
                          { title: 'Blockchain Transaction Log', description: 'All blockchain transactions', type: 'blockchain' },
                          { title: 'Regulatory Compliance', description: 'Compliance with carbon standards', type: 'compliance' }
                        ].map((report) => (
                          <div key={report.type} className="bg-carbon-700/50 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">{report.title}</h4>
                            <p className="text-carbon-300 text-sm mb-4">{report.description}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => exportReport(report.type)}
                                className="flex-1 bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600 transition-colors"
                              >
                                Export PDF
                              </button>
                              <button
                                onClick={() => exportReport(`${report.type}_csv`)}
                                className="flex-1 border border-carbon-600 text-carbon-300 py-2 px-3 rounded text-sm hover:bg-carbon-700 transition-colors"
                              >
                                Export CSV
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;