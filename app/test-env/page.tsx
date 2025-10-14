'use client'

import { useEffect, useState } from 'react'

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID,
      NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID: process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID,
      NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 Environment Variables Test</h1>
      
      <div className="space-y-4">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="bg-gray-800 p-4 rounded-lg">
            <div className="font-semibold text-blue-400">{key}</div>
            <div className="text-gray-300">
              {value ? (
                <span className="text-green-400">
                  ✅ {value.substring(0, 30)}...
                </span>
              ) : (
                <span className="text-red-400">❌ NOT SET</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-900 rounded-lg">
        <h2 className="text-xl font-bold mb-2">📋 Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>All variables should show ✅ with partial values</li>
          <li>If any show ❌ NOT SET, the .env.local file isn't being loaded</li>
          <li>Restart the dev server if needed: <code className="bg-gray-700 px-2 py-1 rounded">npm run dev</code></li>
        </ul>
      </div>
    </div>
  )
}
