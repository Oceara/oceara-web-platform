'use client'

import { useState } from 'react'
import WorkingGoogleLogin from '@/components/WorkingGoogleLogin'
import WorkingSatelliteViewer from '@/components/WorkingSatelliteViewer'

export default function TestWorkingPage() {
  const [showSatellite, setShowSatellite] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🧪 Test Working Components</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Google OAuth Test */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🔐 Google OAuth Test</h2>
          <p className="text-gray-300 mb-4">Test the working Google OAuth component:</p>
          <WorkingGoogleLogin />
        </div>

        {/* Satellite Viewer Test */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🛰️ Satellite Viewer Test</h2>
          <p className="text-gray-300 mb-4">Test the working satellite viewer component:</p>
          <button
            onClick={() => setShowSatellite(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            Open Satellite Viewer
          </button>
        </div>

        {/* Test Coordinates */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">📍 Test Data</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Project:</span>
              <span className="ml-2 text-white">Hooghly Estuary Conservation</span>
            </div>
            <div>
              <span className="text-gray-400">Coordinates:</span>
              <span className="ml-2 text-white">22.351100, 88.225000</span>
            </div>
            <div>
              <span className="text-gray-400">Area:</span>
              <span className="ml-2 text-white">185 hectares</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-green-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-green-400 mb-4">✅ What Should Work</h2>
          <ul className="space-y-2 text-green-200">
            <li>• Google OAuth should redirect to Google's login page</li>
            <li>• Satellite viewer should show satellite images from multiple sources</li>
            <li>• Images should load automatically with fallback options</li>
            <li>• Analysis data should display with realistic values</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔧 If Something Doesn't Work</h2>
          <ul className="space-y-2 text-yellow-200">
            <li>• Check browser console for error messages</li>
            <li>• Make sure you're connected to the internet</li>
            <li>• Try refreshing the page</li>
            <li>• Check if the development server is running</li>
          </ul>
        </div>
      </div>

      {/* Satellite Viewer Modal */}
      {showSatellite && (
        <WorkingSatelliteViewer
          coordinates={{ lat: 22.351100, lng: 88.225000 }}
          projectName="Hooghly Estuary Conservation"
          area={185}
          onClose={() => setShowSatellite(false)}
        />
      )}
    </div>
  )
}
