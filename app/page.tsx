'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import HolographicCard from '@/components/HolographicCard'
import '@/styles/holographic.css'

const RealisticEarth = dynamic(() => import('@/components/RealisticEarth'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading Earth...</div>
})

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const roles = [
    {
      id: 'landowner',
      title: 'Land Owner',
      description: 'Register your mangrove land and earn carbon credits',
      icon: '🌴',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'buyer',
      title: 'Credit Buyer',
      description: 'Purchase verified carbon credits from mangrove projects',
      icon: '💰',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage projects and verify carbon credits',
      icon: '👤',
      color: 'from-purple-500 to-indigo-600'
    }
  ]

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 3D Realistic Earth Background */}
      <div className="absolute inset-0 z-0">
        <RealisticEarth hoveredRole={hoveredRole} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Oceara
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-2 px-2">
            Blue Carbon Ecosystem Platform
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 px-4">
            Protecting Mangroves • Generating Carbon Credits • Fighting Climate Change
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full px-2"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <HolographicCard
                role={role}
                isSelected={selectedRole === role.id}
                onSelect={() => setSelectedRole(role.id)}
                onHover={(isHovered) => setHoveredRole(isHovered ? role.id : null)}
              />
            </motion.div>
          ))}
        </motion.div>

        {selectedRole && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full text-white font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 w-full sm:w-auto max-w-md"
              onClick={() => {
                if (selectedRole === 'landowner') window.location.href = '/auth/login?role=landowner'
                else if (selectedRole === 'buyer') window.location.href = '/auth/login?role=buyer'
                else if (selectedRole === 'admin') window.location.href = '/auth/login?role=admin'
              }}
            >
              Continue as {roles.find(r => r.id === selectedRole)?.title}
            </motion.button>
        )}


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-4 sm:bottom-8 text-center text-gray-400 px-4"
        >
          <p className="text-xs sm:text-sm">
            Join us in protecting 100,000+ hectares of mangrove ecosystems
          </p>
        </motion.div>
      </div>
    </main>
  )
}

