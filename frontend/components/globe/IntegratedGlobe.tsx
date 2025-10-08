'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Globe from '@/threejs/globe';
import { io, Socket } from 'socket.io-client';

interface Project {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  ecosystemType: 'mangrove' | 'wetland' | 'seagrass' | 'salt_marsh' | 'mixed';
  carbonData: {
    calculatedSequestration?: number;
    estimatedSequestration: number;
    confidence?: number;
  };
  area: {
    total: number;
  };
  verificationStatus: string;
  status: string;
  country: string;
  ownerName: string;
}

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  description: string;
  carbonStored?: number;
  area?: number;
  type: 'mangrove' | 'wetland' | 'seagrass';
}

export default function IntegratedGlobe() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: (session as any).accessToken
        }
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        newSocket.emit('subscribe-marketplace');
      });

      newSocket.on('project:status-updated', (data) => {
        console.log('Project status updated:', data);
        fetchProjects(); // Refresh projects
      });

      newSocket.on('verification:status-updated', (data) => {
        console.log('Verification status updated:', data);
        fetchProjects();
      });

      newSocket.on('credits:minted', (data) => {
        console.log('Credits minted:', data);
        fetchProjects();
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [status, session]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/projects?verificationStatus=verified&visibility=public&limit=100');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert projects to hotspots
  const hotspots: Hotspot[] = projects.map(project => ({
    id: project._id,
    name: project.name,
    lat: project.location.coordinates[1],
    lon: project.location.coordinates[0],
    description: project.description,
    carbonStored: project.carbonData.calculatedSequestration || project.carbonData.estimatedSequestration,
    area: project.area.total,
    type: project.ecosystemType === 'mangrove' ? 'mangrove' : 
          project.ecosystemType === 'wetland' ? 'wetland' : 'seagrass'
  }));

  const handleHotspotClick = (hotspot: Hotspot) => {
    const project = projects.find(p => p._id === hotspot.id);
    if (project) {
      setSelectedProject(project);
      setShowProjectModal(true);
    }
  };

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      setShowRoleModal(true);
    } else {
      router.push('/signin');
    }
  };

  const handleRoleSelection = (role: 'landowner' | 'buyer' | 'admin') => {
    setShowRoleModal(false);
    router.push(`/dashboard/${role}`);
  };

  const handleViewOnMap = (project: Project) => {
    // Open Mapbox with project location
    const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9.html?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}#15/${project.location.coordinates[1]}/${project.location.coordinates[0]}`;
    window.open(mapboxUrl, '_blank');
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-500';
      case 'under_review': return 'text-yellow-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Globe */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Loading projects...</div>
          </div>
        ) : (
          <Globe
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
            selectedHotspot={selectedProject ? {
              id: selectedProject._id,
              name: selectedProject.name,
              lat: selectedProject.location.coordinates[1],
              lon: selectedProject.location.coordinates[0],
              description: selectedProject.description,
              carbonStored: selectedProject.carbonData.calculatedSequestration || selectedProject.carbonData.estimatedSequestration,
              area: selectedProject.area.total,
              type: selectedProject.ecosystemType as any
            } : null}
          />
        )}
      </div>

      {/* User Status Indicator */}
      {status === 'authenticated' && session?.user && (
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">
              {session.user.name}
            </span>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
        <div className="flex items-center gap-6 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-xs opacity-75">Active Projects</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + (p.carbonData.calculatedSequestration || p.carbonData.estimatedSequestration), 0).toFixed(0)}
            </div>
            <div className="text-xs opacity-75">Tons CO₂e</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + p.area.total, 0).toFixed(0)}
            </div>
            <div className="text-xs opacity-75">Hectares</div>
          </div>
        </div>
      </div>

      {/* Get Started Button */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <motion.button
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-full font-semibold shadow-2xl hover:from-blue-700 hover:to-blue-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {status === 'authenticated' ? 'Access Dashboard' : 'Get Started'}
        </motion.button>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {showProjectModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                    <p className="text-blue-100">{selectedProject.projectId}</p>
                  </div>
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerificationStatusBadge(selectedProject.verificationStatus)}`}>
                    {selectedProject.verificationStatus.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {selectedProject.ecosystemType.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About This Project</h3>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Carbon Sequestration</div>
                    <div className="text-2xl font-bold text-green-700">
                      {(selectedProject.carbonData.calculatedSequestration || selectedProject.carbonData.estimatedSequestration).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">tons CO₂e</div>
                    {selectedProject.carbonData.confidence && (
                      <div className="text-xs text-green-600 mt-1">
                        {(selectedProject.carbonData.confidence * 100).toFixed(0)}% confidence
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Area</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {selectedProject.area.total}
                    </div>
                    <div className="text-xs text-gray-500">hectares</div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedProject.country}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedProject.location.coordinates[1].toFixed(4)}°N, {selectedProject.location.coordinates[0].toFixed(4)}°E
                  </div>
                </div>

                {/* Owner */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Project Owner</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{selectedProject.ownerName}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleViewOnMap(selectedProject)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    View on Mapbox
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectModal(false);
                      router.push(`/marketplace?project=${selectedProject.projectId}`);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    View Credits
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Selection Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-center mb-2">Select Your Role</h2>
              <p className="text-center text-gray-600 mb-8">Choose how you'd like to participate in the carbon credit ecosystem</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Land Owner */}
                <motion.button
                  onClick={() => handleRoleSelection('landowner')}
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-4xl mb-4">🌳</div>
                  <h3 className="text-xl font-bold mb-2">Land Owner</h3>
                  <p className="text-sm opacity-90">
                    Register your restoration projects and earn carbon credits
                  </p>
                </motion.button>

                {/* Buyer */}
                <motion.button
                  onClick={() => handleRoleSelection('buyer')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-bold mb-2">Buyer</h3>
                  <p className="text-sm opacity-90">
                    Purchase verified carbon credits from restoration projects
                  </p>
                </motion.button>

                {/* Admin */}
                <motion.button
                  onClick={() => handleRoleSelection('admin')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-bold mb-2">Admin</h3>
                  <p className="text-sm opacity-90">
                    Verify projects and manage the carbon credit platform
                  </p>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
