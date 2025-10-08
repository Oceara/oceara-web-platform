'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  MapPinIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface ProjectVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onApprove: (projectId: number, notes: string) => void;
  onReject: (projectId: number, reason: string) => void;
  onRequestChanges: (projectId: number, changes: string[]) => void;
}

const ProjectVerificationModal: React.FC<ProjectVerificationModalProps> = ({
  isOpen,
  onClose,
  project,
  onApprove,
  onReject,
  onRequestChanges
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState<string[]>(['']);
  const [aiOverrides, setAiOverrides] = useState({});

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'images', label: 'Images', icon: PhotoIcon },
    { id: 'gps', label: 'GPS Data', icon: MapPinIcon },
    { id: 'field-data', label: 'Field Data', icon: CloudArrowUpIcon },
    { id: 'ai-results', label: 'AI/ML Results', icon: CpuChipIcon }
  ];

  const handleApprove = () => {
    onApprove(project.id, verificationNotes);
    onClose();
  };

  const handleReject = () => {
    onReject(project.id, rejectionReason);
    onClose();
  };

  const handleRequestChanges = () => {
    const changes = requestedChanges.filter(change => change.trim() !== '');
    onRequestChanges(project.id, changes);
    onClose();
  };

  const addChangeRequest = () => {
    setRequestedChanges([...requestedChanges, '']);
  };

  const updateChangeRequest = (index: number, value: string) => {
    const updated = [...requestedChanges];
    updated[index] = value;
    setRequestedChanges(updated);
  };

  const removeChangeRequest = (index: number) => {
    const updated = requestedChanges.filter((_, i) => i !== index);
    setRequestedChanges(updated);
  };

  const handleAIOverride = (field: string, value: any) => {
    setAiOverrides({ ...aiOverrides, [field]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-carbon-800 rounded-xl shadow-2xl border border-carbon-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-carbon-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                  <p className="text-carbon-300">Project ID: #{project.id}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-carbon-400 hover:text-white hover:bg-carbon-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 p-6 pt-0 border-b border-carbon-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
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

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Project Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-carbon-700/50 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Project Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-carbon-300">Owner:</span>
                              <span className="text-white">{project.owner}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-carbon-300">Location:</span>
                              <span className="text-white">{project.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-carbon-300">Area:</span>
                              <span className="text-white">{project.area} hectares</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-carbon-300">Estimated Carbon:</span>
                              <span className="text-white">{project.estimatedCarbon.toLocaleString()} tons</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-carbon-300">Methodology:</span>
                              <span className="text-white">{project.methodology}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-carbon-300">Submitted:</span>
                              <span className="text-white">{new Date(project.submittedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-carbon-700/50 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Verification Status</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-carbon-300">Current Stage:</span>
                              <span className="text-blue-400 font-medium">{project.verificationStage}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-carbon-300">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                                project.status === 'under_verification' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {project.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-carbon-300">Documents:</span>
                              <span className="text-white">{project.documents.length} files</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-carbon-300">Images:</span>
                              <span className="text-white">{project.images.length} files</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Results Summary */}
                      <div className="bg-carbon-700/50 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">AI/ML Analysis Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-green-400 font-bold text-2xl">
                              {Math.round(project.aiResults.crownDetection.confidence * 100)}%
                            </div>
                            <div className="text-carbon-300 text-sm">Crown Detection</div>
                            <div className="text-carbon-400 text-xs">
                              {project.aiResults.crownDetection.crownsDetected} crowns detected
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-bold text-2xl">
                              {Math.round(project.aiResults.speciesClassification.confidence * 100)}%
                            </div>
                            <div className="text-carbon-300 text-sm">Species Classification</div>
                            <div className="text-carbon-400 text-xs">
                              {project.aiResults.speciesClassification.species}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400 font-bold text-2xl">
                              {Math.round(project.aiResults.healthAssessment.confidence * 100)}%
                            </div>
                            <div className="text-carbon-300 text-sm">Health Assessment</div>
                            <div className="text-carbon-400 text-xs">
                              Score: {project.aiResults.healthAssessment.healthScore}/100
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'documents' && (
                    <motion.div
                      key="documents"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-white font-semibold">Project Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.documents.map((doc: string, index: number) => (
                          <div key={index} className="bg-carbon-700/50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                              <div className="flex-1">
                                <div className="text-white font-medium">{doc}</div>
                                <div className="text-carbon-400 text-sm">PDF Document</div>
                              </div>
                              <button className="p-2 text-carbon-400 hover:text-white hover:bg-carbon-700 rounded-lg transition-colors">
                                <EyeIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'images' && (
                    <motion.div
                      key="images"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-white font-semibold">Project Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.images.map((image: string, index: number) => (
                          <div key={index} className="bg-carbon-700/50 rounded-lg p-4">
                            <div className="aspect-video bg-carbon-600 rounded-lg mb-3 flex items-center justify-center">
                              <PhotoIcon className="w-12 h-12 text-carbon-400" />
                            </div>
                            <div className="text-white font-medium text-sm">{image}</div>
                            <div className="text-carbon-400 text-xs">Drone/Satellite Image</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'gps' && (
                    <motion.div
                      key="gps"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-white font-semibold">GPS Coordinates</h3>
                      <div className="bg-carbon-700/50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-carbon-300 text-sm">Latitude</label>
                            <div className="text-white font-mono text-lg">{project.gpsData.lat}</div>
                          </div>
                          <div>
                            <label className="text-carbon-300 text-sm">Longitude</label>
                            <div className="text-white font-mono text-lg">{project.gpsData.lng}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            View on Map
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'field-data' && (
                    <motion.div
                      key="field-data"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-white font-semibold">Field Data</h3>
                      <div className="bg-carbon-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <CloudArrowUpIcon className="w-8 h-8 text-green-400" />
                          <div className="flex-1">
                            <div className="text-white font-medium">{project.fieldData}</div>
                            <div className="text-carbon-400 text-sm">CSV Data File</div>
                          </div>
                          <button className="p-2 text-carbon-400 hover:text-white hover:bg-carbon-700 rounded-lg transition-colors">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'ai-results' && (
                    <motion.div
                      key="ai-results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-white font-semibold">AI/ML Model Results</h3>
                      
                      {/* Crown Detection */}
                      <div className="bg-carbon-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Crown Detection Analysis</h4>
                          <span className="text-green-400 text-sm font-medium">
                            {Math.round(project.aiResults.crownDetection.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-carbon-300 text-sm mb-3">
                          Detected {project.aiResults.crownDetection.crownsDetected} tree crowns in the project area.
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAIOverride('crownDetection', { confidence: 0.95, crownsDetected: 1300 })}
                            className="bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Accept Result
                          </button>
                          <button
                            onClick={() => handleAIOverride('crownDetection', { confidence: 0.75, crownsDetected: 1000 })}
                            className="border border-yellow-500 text-yellow-400 py-1 px-3 rounded text-sm hover:bg-yellow-500/10 transition-colors"
                          >
                            Override
                          </button>
                        </div>
                      </div>

                      {/* Species Classification */}
                      <div className="bg-carbon-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Species Classification</h4>
                          <span className="text-blue-400 text-sm font-medium">
                            {Math.round(project.aiResults.speciesClassification.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-carbon-300 text-sm mb-3">
                          Primary species identified: {project.aiResults.speciesClassification.species}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAIOverride('speciesClassification', { confidence: 0.95, species: 'Rhizophora mucronata' })}
                            className="bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Accept Result
                          </button>
                          <button
                            onClick={() => handleAIOverride('speciesClassification', { confidence: 0.85, species: 'Avicennia marina' })}
                            className="border border-yellow-500 text-yellow-400 py-1 px-3 rounded text-sm hover:bg-yellow-500/10 transition-colors"
                          >
                            Override
                          </button>
                        </div>
                      </div>

                      {/* Health Assessment */}
                      <div className="bg-carbon-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Tree Health Assessment</h4>
                          <span className="text-purple-400 text-sm font-medium">
                            {Math.round(project.aiResults.healthAssessment.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-carbon-300 text-sm mb-3">
                          Overall health score: {project.aiResults.healthAssessment.healthScore}/100
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAIOverride('healthAssessment', { confidence: 0.90, healthScore: 90 })}
                            className="bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Accept Result
                          </button>
                          <button
                            onClick={() => handleAIOverride('healthAssessment', { confidence: 0.80, healthScore: 75 })}
                            className="border border-yellow-500 text-yellow-400 py-1 px-3 rounded text-sm hover:bg-yellow-500/10 transition-colors"
                          >
                            Override
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-carbon-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-carbon-300 text-sm font-medium mb-2">
                      Verification Notes
                    </label>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      className="w-full px-3 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-purple-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleApprove}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={handleRequestChanges}
                      className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                      <span>Request Changes</span>
                    </button>
                    
                    <button
                      onClick={handleReject}
                      className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Rejection Reason */}
                {rejectionReason && (
                  <div className="mt-4">
                    <label className="block text-carbon-300 text-sm font-medium mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a detailed reason for rejection..."
                      className="w-full px-3 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-red-500 focus:outline-none"
                      rows={2}
                    />
                  </div>
                )}

                {/* Requested Changes */}
                {requestedChanges.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-carbon-300 text-sm font-medium mb-2">
                      Requested Changes
                    </label>
                    <div className="space-y-2">
                      {requestedChanges.map((change, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={change}
                            onChange={(e) => updateChangeRequest(index, e.target.value)}
                            placeholder="Describe the required change..."
                            className="flex-1 px-3 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-yellow-500 focus:outline-none"
                          />
                          <button
                            onClick={() => removeChangeRequest(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addChangeRequest}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <span>+ Add another change request</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectVerificationModal;
