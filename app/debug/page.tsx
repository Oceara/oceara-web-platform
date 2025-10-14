'use client'

import { useState, useEffect } from 'react'
import { googleAuthService } from '@/lib/googleAuth'
import { earthEngineService } from '@/lib/earthEngine'

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results: any = {}

    // Test 1: Environment Variables
    results.envVars = {
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID,
    }

    // Test 2: Google Auth Service
    results.googleAuth = {
      isConfigured: googleAuthService.isConfigured(),
      clientId: googleAuthService['clientId']?.substring(0, 20) + '...'
    }

    // Test 3: Image Sources
    const testCoords = { lat: 22.3511, lng: 88.2250 }
    results.imageSources = earthEngineService.getImageSources(testCoords, 'true-color', 14)

    // Test 4: Try to load Google Script
    try {
      await googleAuthService.initialize()
      results.googleScript = { loaded: true }
    } catch (error) {
      results.googleScript = { loaded: false, error: error.message }
    }

    // Test 5: Test Image Loading
    const testImageUrl = results.imageSources[0]
    try {
      const response = await fetch(testImageUrl, { method: 'HEAD' })
      results.imageTest = { 
        url: testImageUrl.substring(0, 80) + '...',
        status: response.status,
        success: response.ok 
      }
    } catch (error) {
      results.imageTest = { 
        url: testImageUrl.substring(0, 80) + '...',
        error: error.message,
        success: false 
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const testGoogleAuth = async () => {
    try {
      const result = await googleAuthService.signIn()
      alert(`Google Auth Result: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      alert(`Google Auth Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 Debug & Diagnostic Page</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Running tests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Environment Variables */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-2">Environment Variables</h3>
                {Object.entries(testResults.envVars || {}).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-400">{key}:</span>
                    <span className={`ml-2 ${value ? 'text-green-400' : 'text-red-400'}`}>
                      {value ? `${String(value).substring(0, 30)}...` : 'NOT SET'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Google Auth */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-2">Google Auth Service</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-400">Configured:</span>
                    <span className={`ml-2 ${testResults.googleAuth?.isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                      {testResults.googleAuth?.isConfigured ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Client ID:</span>
                    <span className="ml-2 text-white">{testResults.googleAuth?.clientId}</span>
                  </div>
                </div>
              </div>

              {/* Google Script */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-2">Google Script Loading</h3>
                <div className="text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={`ml-2 ${testResults.googleScript?.loaded ? 'text-green-400' : 'text-red-400'}`}>
                    {testResults.googleScript?.loaded ? '✅ Loaded' : '❌ Failed'}
                  </span>
                  {testResults.googleScript?.error && (
                    <div className="text-red-400 text-xs mt-1">
                      Error: {testResults.googleScript.error}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Test */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-2">Image Loading Test</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-400">URL:</span>
                    <span className="ml-2 text-white text-xs">{testResults.imageTest?.url}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 ${testResults.imageTest?.success ? 'text-green-400' : 'text-red-400'}`}>
                      {testResults.imageTest?.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                  {testResults.imageTest?.status && (
                    <div>
                      <span className="text-gray-400">HTTP Status:</span>
                      <span className="ml-2 text-white">{testResults.imageTest.status}</span>
                    </div>
                  )}
                  {testResults.imageTest?.error && (
                    <div className="text-red-400 text-xs">
                      Error: {testResults.imageTest.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Actions</h2>
          
          <button
            onClick={runTests}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-semibold"
          >
            🔄 Run Tests Again
          </button>

          <button
            onClick={testGoogleAuth}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
          >
            🔐 Test Google Auth
          </button>

          <div className="bg-yellow-900 p-4 rounded-lg">
            <h3 className="font-bold text-yellow-400 mb-2">Common Issues & Solutions</h3>
            <ul className="text-sm space-y-1 text-yellow-200">
              <li>• If env vars show "NOT SET" → Restart dev server</li>
              <li>• If Google Auth fails → Check OAuth client settings</li>
              <li>• If images fail → Check API key restrictions</li>
              <li>• If script fails → Check network/firewall</li>
            </ul>
          </div>

          <div className="bg-blue-900 p-4 rounded-lg">
            <h3 className="font-bold text-blue-400 mb-2">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="/auth/login" className="block text-blue-300 hover:text-blue-200">
                → Test Login Page
              </a>
              <a href="/admin" className="block text-blue-300 hover:text-blue-200">
                → Test Admin Page
              </a>
              <a href="/test-env" className="block text-blue-300 hover:text-blue-200">
                → Environment Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
