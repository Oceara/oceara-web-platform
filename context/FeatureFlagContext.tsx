'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/lib/simpleAuth'
import { canSeeAdvancedFeatures } from '@/lib/featureFlags'

interface FeatureFlagContextType {
  canSeeAdvancedFeatures: boolean
  userEmail: string | null
  loading: boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [demoEmail, setDemoEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.email) {
      setDemoEmail(null)
      setLoading(false)
      return
    }
    const demoUser = authService.getCurrentUser()
    setDemoEmail(demoUser?.email ?? null)
    setLoading(false)
  }, [user?.email])

  const userEmail = user?.email ?? demoEmail
  const advanced = canSeeAdvancedFeatures(userEmail ?? undefined)

  return (
    <FeatureFlagContext.Provider
      value={{
        canSeeAdvancedFeatures: advanced,
        userEmail,
        loading,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}
