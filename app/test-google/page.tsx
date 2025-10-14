'use client'

import { useState } from 'react'

export default function TestGooglePage() {
  const [testUrl, setTestUrl] = useState('')

  const generateGoogleAuthUrl = () => {
    const clientId = '187601325863-45db1i9onqndts56g42ccub6gf0onqss.apps.googleusercontent.com'
    
    // Show both localhost and production URLs
    const isLocalhost = window.location.hostname === 'localhost'
    const redirectUri = isLocalhost 
      ? encodeURIComponent('http://localhost:3000/auth/callback')
      : encodeURIComponent('https://oceara-web-platform.vercel.app/auth/callback')
    
    const scope = encodeURIComponent('openid email profile')
    
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `access_type=offline`
    
    setTestUrl(googleAuthUrl)
    console.log('🔗 Generated Google Auth URL:', googleAuthUrl)
    console.log('📍 Current environment:', isLocalhost ? 'localhost' : 'production')
  }

  const testGoogleAuth = () => {
    if (testUrl) {
      window.open(testUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 Google OAuth Test</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test Google OAuth URL Generation</h2>
          
          <button
            onClick={generateGoogleAuthUrl}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold mb-4"
          >
            Generate Google Auth URL
          </button>
          
          {testUrl && (
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Generated URL:</h3>
                <p className="text-sm text-gray-300 break-all">{testUrl}</p>
              </div>
              
              <button
                onClick={testGoogleAuth}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
              >
                Test Google OAuth (Opens in New Tab)
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Current Configuration</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Client ID:</span>
              <span className="ml-2 text-white">187601325863-45db1i9onqndts56g42ccub6gf0onqss.apps.googleusercontent.com</span>
            </div>
            <div>
              <span className="text-gray-400">Current Environment:</span>
              <span className="ml-2 text-white">{window.location.hostname === 'localhost' ? 'localhost' : 'production'}</span>
            </div>
            <div>
              <span className="text-gray-400">Redirect URI (localhost):</span>
              <span className="ml-2 text-white">http://localhost:3000/auth/callback</span>
            </div>
            <div>
              <span className="text-gray-400">Redirect URI (production):</span>
              <span className="ml-2 text-white">https://oceara-web-platform.vercel.app/auth/callback</span>
            </div>
            <div>
              <span className="text-gray-400">Scope:</span>
              <span className="ml-2 text-white">openid email profile</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Troubleshooting</h2>
          <ul className="space-y-2 text-yellow-200">
            <li>• If the URL doesn't work, check Google Cloud Console OAuth settings</li>
            <li>• For localhost: Add <code className="bg-gray-700 px-2 py-1 rounded">http://localhost:3000/auth/callback</code></li>
            <li>• For production: Add <code className="bg-gray-700 px-2 py-1 rounded">https://oceara-web-platform.vercel.app/auth/callback</code></li>
            <li>• Check that the Client ID is correct and active</li>
            <li>• Verify OAuth consent screen is configured</li>
            <li>• <strong>Try the production URL:</strong> <a href="https://oceara-web-platform.vercel.app" target="_blank" className="text-blue-300 hover:text-blue-200">https://oceara-web-platform.vercel.app</a></li>
          </ul>
        </div>

        <div className="bg-blue-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/auth/login" className="block text-blue-300 hover:text-blue-200">
              → Test Login Page
            </a>
            <a href="/debug" className="block text-blue-300 hover:text-blue-200">
              → Debug Page
            </a>
            <a href="/admin" className="block text-blue-300 hover:text-blue-200">
              → Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
