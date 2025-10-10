'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ImageVerificationPanel from './ImageVerificationPanel'

interface ProjectDetailModalProps {
  project: any
  onClose: () => void
  onApprove: (projectId: number, carbonCredits: number) => void
  onReject: (projectId: number, reason: string) => void
}

export default function ProjectDetailModal({ project, onClose, onApprove, onReject }: ProjectDetailModalProps) {
  const [activeSection, setActiveSection] = useState('overview')
  const [manualCarbonValue, setManualCarbonValue] = useState(project.aiResults?.carbonPotential || 0)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'images', label: 'Image Verification', icon: '📷' },
    { id: 'data', label: 'Field Data', icon: '📊' },
    { id: 'ml', label: 'ML Analysis', icon: '🤖' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'map', label: 'Location', icon: '🗺️' }
  ]

  const handleImageVerify = (imageId: number, status: 'approved' | 'rejected', notes: string) => {
    console.log(`Image ${imageId} ${status}:`, notes)
    // In real app: Update image verification status
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl w-full max-w-7xl border border-white/20 my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{project.name}</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-white font-semibold">{project.owner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">📍 {project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Submitted:</span>
                  <span className="text-white">{project.submittedDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                project.status === 'Pending Review'
                  ? 'bg-yellow-500'
                  : project.status === 'Under Verification'
                  ? 'bg-blue-500'
                  : 'bg-green-500'
              }`}>
                {project.status}
              </span>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-6 py-4 border-b border-white/20 overflow-x-auto">
          <div className="flex gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-gray-400 text-sm mb-1">Total Area</div>
                  <div className="text-2xl font-bold text-white">{project.area}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-gray-400 text-sm mb-1">Tree Count (AI)</div>
                  <div className="text-2xl font-bold text-green-400">{project.aiResults.treeCount.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-gray-400 text-sm mb-1">Carbon Potential</div>
                  <div className="text-2xl font-bold text-blue-400">{project.aiResults.carbonPotential}t</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-gray-400 text-sm mb-1">AI Confidence</div>
                  <div className="text-2xl font-bold text-purple-400">{project.aiResults.confidence}%</div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">✅ Verification Checklist</h3>
                <div className="space-y-3">
                  {[
                    { item: 'GPS coordinates verified', status: true },
                    { item: 'Satellite imagery analyzed', status: true },
                    { item: 'ML analysis completed', status: true },
                    { item: 'Field data submitted', status: true },
                    { item: 'Legal documents uploaded', status: true },
                    { item: 'Environmental clearance', status: project.documents?.length >= 3 }
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        check.status ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        {check.status ? '✓' : '⏳'}
                      </div>
                      <span className="text-white">{check.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Override */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Manual Carbon Value Override</span>
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  AI calculated {project.aiResults.carbonPotential} tons of carbon credits. 
                  Adjust if needed based on expert review.
                </p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={manualCarbonValue}
                    onChange={(e) => setManualCarbonValue(parseFloat(e.target.value))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-semibold text-lg"
                  />
                  <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold transition-all">
                    Apply Override
                  </button>
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  Difference: {manualCarbonValue !== project.aiResults.carbonPotential 
                    ? `${manualCarbonValue > project.aiResults.carbonPotential ? '+' : ''}${(manualCarbonValue - project.aiResults.carbonPotential).toFixed(1)} tons`
                    : 'No change'}
                </div>
              </div>
            </div>
          )}

          {/* Image Verification Section */}
          {activeSection === 'images' && (
            <ImageVerificationPanel project={project} onVerify={handleImageVerify} />
          )}

          {/* Field Data Section */}
          {activeSection === 'data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">🌳 Landowner Provided Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Tree Count</span>
                    <span className="text-white font-semibold">{project.fieldData.trees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Species</span>
                    <span className="text-white font-semibold italic">{project.fieldData.species}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Soil Type</span>
                    <span className="text-white font-semibold">{project.fieldData.soilType}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Water Salinity</span>
                    <span className="text-white font-semibold">{project.fieldData.waterSalinity}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">🤖 AI Detected Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Tree Count (AI)</span>
                    <span className="text-white font-semibold">{project.aiResults.treeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Health Score</span>
                    <span className="text-green-400 font-semibold">{project.aiResults.healthScore}%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Carbon Potential</span>
                    <span className="text-blue-400 font-semibold">{project.aiResults.carbonPotential}t</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Confidence Level</span>
                    <span className="text-purple-400 font-semibold">{project.aiResults.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Data Comparison */}
              <div className="md:col-span-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">📊 Data Comparison Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Tree Count Accuracy</span>
                      <span className="text-white font-semibold">
                        {((project.aiResults.treeCount / project.fieldData.trees) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${((project.aiResults.treeCount / project.fieldData.trees) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                    <span className="text-xl">✓</span>
                    <div>
                      <div className="text-white font-semibold">Data Match: Excellent</div>
                      <div className="text-gray-300 text-sm">
                        AI detection closely matches field data ({Math.abs(project.aiResults.treeCount - project.fieldData.trees)} tree difference)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ML Analysis Section */}
          {activeSection === 'ml' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>🧠</span>
                  <span>Computer Vision Model Results</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Model Used</div>
                    <div className="text-white font-semibold">Mangrove-CNN v2.4</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Processing Time</div>
                    <div className="text-white font-semibold">2.4 seconds</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Images Analyzed</div>
                    <div className="text-white font-semibold">{project.images?.length || 3}</div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Detection Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { metric: 'Tree Detection Accuracy', value: 95.2, color: 'green' },
                        { metric: 'Species Classification', value: 89.7, color: 'blue' },
                        { metric: 'Health Assessment', value: 92.1, color: 'yellow' },
                        { metric: 'Area Calculation', value: 96.8, color: 'purple' }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{item.metric}</span>
                            <span className="text-white font-semibold">{item.value}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className={`bg-${item.color}-500 h-2 rounded-full`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Carbon Calculation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-white/5 rounded">
                        <span className="text-gray-400">Base Carbon (tons/ha)</span>
                        <span className="text-white font-mono">2.5</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white/5 rounded">
                        <span className="text-gray-400">Total Area (ha)</span>
                        <span className="text-white font-mono">{parseFloat(project.area)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white/5 rounded">
                        <span className="text-gray-400">Health Factor</span>
                        <span className="text-white font-mono">{(project.aiResults.healthScore / 100).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/20 my-2"></div>
                      <div className="flex justify-between p-2 bg-blue-500/20 rounded">
                        <span className="text-white font-semibold">Total Credits</span>
                        <span className="text-blue-400 font-bold text-lg">{project.aiResults.carbonPotential}t</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Confidence Breakdown */}
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">📈 Confidence Score Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Overall Confidence</span>
                      <span className="text-2xl font-bold text-white">{project.aiResults.confidence}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full"
                        style={{ width: `${project.aiResults.confidence}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <div className="text-green-400 font-bold text-xl">High</div>
                      <div className="text-gray-400 text-xs">≥90% confidence</div>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <div className="text-yellow-400 font-bold text-xl">Medium</div>
                      <div className="text-gray-400 text-xs">70-89% confidence</div>
                    </div>
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <div className="text-red-400 font-bold text-xl">Low</div>
                      <div className="text-gray-400 text-xs">&lt;70% confidence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Section */}
          {activeSection === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">📄 Uploaded Legal Documents</h3>
              {project.documents?.map((doc: string, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">
                      📄
                    </div>
                    <div>
                      <div className="text-white font-semibold">{doc}</div>
                      <div className="text-gray-400 text-sm">PDF • 2.4 MB • Uploaded {project.submittedDate}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold transition-all">
                      View
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-semibold transition-all">
                      Download
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <div className="text-white font-semibold">All Required Documents Submitted</div>
                    <div className="text-gray-300 text-sm">
                      {project.documents?.length || 0} documents verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Section */}
          {activeSection === 'map' && (
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-4">📍 GPS Coordinates</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-gray-400 text-sm">Latitude</div>
                    <div className="text-white font-mono text-lg">{project.gpsData?.lat || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-gray-400 text-sm">Longitude</div>
                    <div className="text-white font-mono text-lg">{project.gpsData?.lng || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden border border-white/20">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9!2d${project.gpsData?.lng || 88.8837}!3d${project.gpsData?.lat || 21.9497}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDU2JzU4LjkiTiA4OMKwNTMnMDEuMyJF!5e1!3m2!1sen!2sin!4v1234567890`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <button
                onClick={() => window.open(`https://www.google.com/maps?q=${project.gpsData?.lat},${project.gpsData?.lng}&z=15&t=k`, '_blank')}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all"
              >
                🗺️ Open in Google Maps
              </button>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-white/20 bg-white/5">
          {!showRejectForm ? (
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-all"
              >
                ❌ Reject Project
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => onApprove(project.id, manualCarbonValue)}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-2xl rounded-lg text-white font-bold text-lg transition-all"
              >
                ✅ Approve & Mint {manualCarbonValue} Carbon Credits
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
                  placeholder="Provide detailed reason for rejection..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReject(project.id, rejectionReason)
                    onClose()
                  }}
                  className="flex-1 px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold transition-all"
                  disabled={!rejectionReason}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

