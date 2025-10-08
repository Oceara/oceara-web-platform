'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  CloudArrowUpIcon, 
  MapPinIcon, 
  TreeIcon, 
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LanguageIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const LandownerDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [ecosystems, setEcosystems] = useState([]);
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEcosystemForm, setShowEcosystemForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [language, setLanguage] = useState('en');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    treeCount: '',
    species: '',
    restorationDate: '',
    gpsLat: '',
    gpsLng: ''
  });

  // Mock data
  useEffect(() => {
    setEcosystems([
      {
        id: 1,
        name: 'Mangrove Forest - Goa',
        location: 'Goa, India',
        area: 500,
        treeCount: 15000,
        species: 'Rhizophora mucronata',
        restorationDate: '2023-01-15',
        status: 'verified',
        carbonStored: 25000,
        creditsEarned: 1250,
        progress: 'Credits Issued',
        beforeImages: ['before1.jpg', 'before2.jpg'],
        afterImages: ['after1.jpg', 'after2.jpg'],
        gpsCoordinates: { lat: 15.2993, lng: 74.1240 },
        droneImages: ['drone1.jpg', 'drone2.jpg'],
        fieldData: 'field_data_2024.pdf'
      },
      {
        id: 2,
        name: 'Coastal Wetland - Karnataka',
        location: 'Karnataka, India',
        area: 300,
        treeCount: 8000,
        species: 'Avicennia marina',
        restorationDate: '2023-06-20',
        status: 'under_review',
        carbonStored: 15000,
        creditsEarned: 750,
        progress: 'Under Review',
        beforeImages: ['before3.jpg'],
        afterImages: ['after3.jpg'],
        gpsCoordinates: { lat: 12.9716, lng: 77.5946 },
        droneImages: ['drone3.jpg'],
        fieldData: 'field_data_2024_2.pdf'
      },
    ]);

    setCarbonCredits([
      {
        id: 1,
        ecosystemId: 1,
        amount: 1250,
        price: 15.50,
        totalValue: 19375,
        issuedDate: '2024-01-15',
        status: 'active',
      },
      {
        id: 2,
        ecosystemId: 2,
        amount: 750,
        price: 15.50,
        totalValue: 11625,
        issuedDate: '2024-01-20',
        status: 'pending',
      },
    ]);

    setIsLoading(false);
  }, []);

  const stats = [
    {
      title: 'Total Ecosystems',
      value: ecosystems.length,
      icon: '🌊',
      color: 'text-green-400',
    },
    {
      title: 'Carbon Credits',
      value: carbonCredits.reduce((sum, credit) => sum + credit.amount, 0),
      icon: '🌱',
      color: 'text-blue-400',
    },
    {
      title: 'Total Earnings',
      value: `$${carbonCredits.reduce((sum, credit) => sum + credit.totalValue, 0).toLocaleString()}`,
      icon: '💰',
      color: 'text-yellow-400',
    },
    {
      title: 'Verified Areas',
      value: ecosystems.filter(eco => eco.status === 'verified').length,
      icon: '✅',
      color: 'text-emerald-400',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ecosystems', label: 'Ecosystems', icon: '🌊' },
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'credits', label: 'Carbon Credits', icon: '🌱' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
  ];

  const progressSteps = [
    { id: 'submitted', label: 'Data Submitted', icon: DocumentTextIcon, color: 'text-blue-400' },
    { id: 'review', label: 'Under Review', icon: ClockIcon, color: 'text-yellow-400' },
    { id: 'verified', label: 'Verified', icon: CheckCircleIcon, color: 'text-green-400' },
    { id: 'credits', label: 'Credits Issued', icon: CurrencyDollarIcon, color: 'text-emerald-400' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'pt', name: 'Português' },
  ];

  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setShowEcosystemForm(false);
    setFormData({
      name: '',
      location: '',
      area: '',
      treeCount: '',
      species: '',
      restorationDate: '',
      gpsLat: '',
      gpsLng: ''
    });
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircleIcon;
      case 'under_review': return ClockIcon;
      case 'pending': return ExclamationTriangleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400';
      case 'under_review': return 'text-yellow-400';
      case 'pending': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <ProtectedRoute requiredRole={ROLES.LANDOWNER}>
      <div className={`min-h-screen bg-carbon-900 ${accessibilityMode ? 'text-lg' : ''}`}>
        <Header />
        
        {/* Accessibility & Language Controls */}
        <div className="fixed top-20 right-4 z-40 flex flex-col space-y-2">
          <div className="bg-carbon-800/90 backdrop-blur-sm border border-carbon-700 rounded-lg p-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-white text-sm border-none outline-none"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-carbon-800">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            className="bg-carbon-800/90 backdrop-blur-sm border border-carbon-700 rounded-lg p-2 text-white hover:bg-carbon-700 transition-colors"
            title="Toggle Accessibility Mode"
          >
            {accessibilityMode ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>

        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-800 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className={`font-bold text-white mb-4 ${accessibilityMode ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'}`}>
                  Land Owner Dashboard
                </h1>
                <p className={`text-green-100 mb-8 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
                  Manage your ecosystems, track carbon sequestration, and earn from carbon credits
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEcosystemForm(true)}
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Register New Ecosystem
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-200"
                  >
                    Upload Data
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
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6 text-center"
                  >
                    <div className={`mb-3 ${accessibilityMode ? 'text-4xl' : 'text-3xl'}`}>{stat.icon}</div>
                    <div className={`font-bold ${stat.color} mb-2 ${accessibilityMode ? 'text-4xl' : 'text-3xl'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-carbon-300 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>{stat.title}</div>
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
                          ? 'bg-green-500 text-white'
                          : 'text-carbon-300 hover:text-white hover:bg-carbon-700'
                      }`}
                    >
                      <span>{tab.icon}</span>
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
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Recent Ecosystems */}
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className={`font-bold text-white mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>Recent Ecosystems</h3>
                      <div className="space-y-4">
                        {ecosystems.slice(0, 3).map((ecosystem) => (
                          <div key={ecosystem.id} className="flex items-center justify-between p-3 bg-carbon-700/50 rounded-lg">
                            <div>
                              <div className={`text-white font-medium ${accessibilityMode ? 'text-lg' : ''}`}>{ecosystem.name}</div>
                              <div className={`text-carbon-400 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>{ecosystem.location}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ecosystem.status === 'verified' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {ecosystem.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Credits */}
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className={`font-bold text-white mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>Recent Carbon Credits</h3>
                      <div className="space-y-4">
                        {carbonCredits.slice(0, 3).map((credit) => (
                          <div key={credit.id} className="flex items-center justify-between p-3 bg-carbon-700/50 rounded-lg">
                            <div>
                              <div className={`text-white font-medium ${accessibilityMode ? 'text-lg' : ''}`}>{credit.amount} Credits</div>
                              <div className={`text-carbon-400 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>${credit.totalValue.toLocaleString()}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              credit.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {credit.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ecosystems' && (
                  <motion.div
                    key="ecosystems"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    {ecosystems.map((ecosystem, index) => (
                      <div
                        key={ecosystem.id}
                        className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className={`font-bold text-white mb-2 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
                              {ecosystem.name}
                            </h3>
                            <p className={`text-carbon-300 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>Location: {ecosystem.location}</p>
                            <div className={`flex flex-wrap gap-4 text-carbon-400 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                              <span>Area: {ecosystem.area} km²</span>
                              <span>Trees: {ecosystem.treeCount.toLocaleString()}</span>
                              <span>Species: {ecosystem.species}</span>
                              <span>Restored: {ecosystem.restorationDate}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            ecosystem.status === 'verified' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {ecosystem.status}
                          </span>
                        </div>
                        
                        {/* Progress Tracking */}
                        <div className="mb-6">
                          <h4 className={`text-white font-semibold mb-3 ${accessibilityMode ? 'text-lg' : ''}`}>Progress Tracking</h4>
                          <div className="flex items-center space-x-4">
                            {progressSteps.map((step, stepIndex) => {
                              const isActive = ecosystem.progress === step.label;
                              const isCompleted = progressSteps.findIndex(s => s.label === ecosystem.progress) > stepIndex;
                              const Icon = step.icon;
                              
                              return (
                                <div key={step.id} className="flex items-center">
                                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    isActive || isCompleted 
                                      ? 'border-green-400 bg-green-400/20' 
                                      : 'border-carbon-600 bg-carbon-700/50'
                                  }`}>
                                    <Icon className={`w-5 h-5 ${
                                      isActive || isCompleted ? 'text-green-400' : 'text-carbon-400'
                                    }`} />
                                  </div>
                                  {stepIndex < progressSteps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-2 ${
                                      isCompleted ? 'bg-green-400' : 'bg-carbon-600'
                                    }`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className={`text-carbon-300 mt-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                            Current Status: <span className="text-green-400 font-medium">{ecosystem.progress}</span>
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-carbon-700/50 rounded-lg p-3">
                            <div className={`text-green-400 font-semibold ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Carbon Stored</div>
                            <div className={`text-white ${accessibilityMode ? 'text-lg' : ''}`}>{ecosystem.carbonStored.toLocaleString()} tons</div>
                          </div>
                          <div className="bg-carbon-700/50 rounded-lg p-3">
                            <div className={`text-green-400 font-semibold ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Credits Earned</div>
                            <div className={`text-white ${accessibilityMode ? 'text-lg' : ''}`}>{ecosystem.creditsEarned.toLocaleString()}</div>
                          </div>
                          <div className="bg-carbon-700/50 rounded-lg p-3">
                            <div className={`text-green-400 font-semibold ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Estimated Value</div>
                            <div className={`text-white ${accessibilityMode ? 'text-lg' : ''}`}>${(ecosystem.creditsEarned * 15.50).toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                          <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                            View Details
                          </button>
                          <button className="border border-carbon-600 text-carbon-300 px-6 py-2 rounded-lg font-medium hover:bg-carbon-700 transition-colors">
                            Update Data
                          </button>
                          <button className="border border-green-600 text-green-400 px-6 py-2 rounded-lg font-medium hover:bg-green-500/10 transition-colors">
                            Upload Photos
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                  >
                    {/* Large Upload Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-all duration-200"
                      >
                        <CloudArrowUpIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className={`text-white font-bold mb-2 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>Field Data</h3>
                        <p className={`text-carbon-300 mb-4 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                          Upload GPS coordinates, soil samples, and field measurements
                        </p>
                        <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                          Upload Files
                        </button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-all duration-200"
                      >
                        <PhotoIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                        <h3 className={`text-white font-bold mb-2 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>Drone Images</h3>
                        <p className={`text-carbon-300 mb-4 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                          Upload aerial photography and drone survey data
                        </p>
                        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                          Upload Images
                        </button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-all duration-200"
                      >
                        <MapPinIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h3 className={`text-white font-bold mb-2 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>GPS Coordinates</h3>
                        <p className={`text-carbon-300 mb-4 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                          Upload precise location data and boundary coordinates
                        </p>
                        <button className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors">
                          Upload GPS Data
                        </button>
                      </motion.div>
                    </div>

                    {/* Drag and Drop Photo Upload */}
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-8">
                      <h3 className={`text-white font-bold mb-6 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>Before/After Restoration Photos</h3>
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragActive 
                            ? 'border-green-400 bg-green-400/10' 
                            : 'border-carbon-600 hover:border-green-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <CloudArrowUpIcon className="w-16 h-16 text-carbon-400 mx-auto mb-4" />
                        <p className={`text-carbon-300 mb-4 ${accessibilityMode ? 'text-lg' : ''}`}>
                          Drag and drop your photos here, or click to browse
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors cursor-pointer inline-block"
                        >
                          Choose Photos
                        </label>
                      </div>

                      {/* Selected Files */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-6">
                          <h4 className={`text-white font-semibold mb-3 ${accessibilityMode ? 'text-lg' : ''}`}>Selected Files</h4>
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-carbon-700/50 rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <PhotoIcon className="w-5 h-5 text-green-400" />
                                  <span className={`text-white ${accessibilityMode ? 'text-base' : 'text-sm'}`}>{file.name}</span>
                                  <span className={`text-carbon-400 ${accessibilityMode ? 'text-sm' : 'text-xs'}`}>
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'credits' && (
                  <motion.div
                    key="credits"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-carbon-700/50">
                          <tr>
                            <th className={`px-6 py-4 text-left text-carbon-300 font-medium ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Ecosystem</th>
                            <th className={`px-6 py-4 text-left text-carbon-300 font-medium ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Credits</th>
                            <th className={`px-6 py-4 text-left text-carbon-300 font-medium ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Price</th>
                            <th className={`px-6 py-4 text-left text-carbon-300 font-medium ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Total Value</th>
                            <th className={`px-6 py-4 text-left text-carbon-300 font-medium ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Issued Date</th>
                            <th className={`px-6 py-4 text-left text-carbon-300 font-medium ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {carbonCredits.map((credit) => (
                            <tr key={credit.id} className="border-t border-carbon-700">
                              <td className={`px-6 py-4 text-white ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                                {ecosystems.find(eco => eco.id === credit.ecosystemId)?.name}
                              </td>
                              <td className={`px-6 py-4 text-white ${accessibilityMode ? 'text-base' : 'text-sm'}`}>{credit.amount.toLocaleString()}</td>
                              <td className={`px-6 py-4 text-white ${accessibilityMode ? 'text-base' : 'text-sm'}`}>${credit.price}</td>
                              <td className={`px-6 py-4 text-white ${accessibilityMode ? 'text-base' : 'text-sm'}`}>${credit.totalValue.toLocaleString()}</td>
                              <td className={`px-6 py-4 text-carbon-300 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>{credit.issuedDate}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  credit.status === 'active' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {credit.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'earnings' && (
                  <motion.div
                    key="earnings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className={`font-bold text-white mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>Earnings Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className={`font-bold text-green-400 mb-2 ${accessibilityMode ? 'text-4xl' : 'text-3xl'}`}>
                            ${carbonCredits.reduce((sum, credit) => sum + credit.totalValue, 0).toLocaleString()}
                          </div>
                          <div className={`text-carbon-300 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Total Earnings</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold text-blue-400 mb-2 ${accessibilityMode ? 'text-4xl' : 'text-3xl'}`}>
                            {carbonCredits.reduce((sum, credit) => sum + credit.amount, 0).toLocaleString()}
                          </div>
                          <div className={`text-carbon-300 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Total Credits</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold text-yellow-400 mb-2 ${accessibilityMode ? 'text-4xl' : 'text-3xl'}`}>
                            $15.50
                          </div>
                          <div className={`text-carbon-300 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>Average Price</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
                      <h3 className={`font-bold text-white mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>Monthly Earnings</h3>
                      <div className="text-carbon-300 text-center py-8">
                        <div className={`${accessibilityMode ? 'text-lg' : ''}`}>
                          📊 Chart visualization would go here
                        </div>
                        <p className={`mt-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                          Interactive chart showing carbon credit earnings over time
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>

        {/* Ecosystem Registration Modal */}
        <AnimatePresence>
          {showEcosystemForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-carbon-800 border border-carbon-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-white font-bold ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
                    Register New Ecosystem
                  </h2>
                  <button
                    onClick={() => setShowEcosystemForm(false)}
                    className="text-carbon-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        Ecosystem Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        Area (km²)
                      </label>
                      <input
                        type="number"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        Tree Count
                      </label>
                      <input
                        type="number"
                        value={formData.treeCount}
                        onChange={(e) => setFormData({...formData, treeCount: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        Species Type
                      </label>
                      <input
                        type="text"
                        value={formData.species}
                        onChange={(e) => setFormData({...formData, species: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        Restoration Date
                      </label>
                      <input
                        type="date"
                        value={formData.restorationDate}
                        onChange={(e) => setFormData({...formData, restorationDate: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        GPS Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.gpsLat}
                        onChange={(e) => setFormData({...formData, gpsLat: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-carbon-300 mb-2 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                        GPS Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.gpsLng}
                        onChange={(e) => setFormData({...formData, gpsLng: e.target.value})}
                        className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEcosystemForm(false)}
                      className="px-6 py-2 border border-carbon-600 text-carbon-300 rounded-lg hover:bg-carbon-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Register Ecosystem
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default LandownerDashboard;