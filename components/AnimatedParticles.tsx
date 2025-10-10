'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AnimatedParticlesProps {
  hoveredRole: string | null
}

export default function AnimatedParticles({ hoveredRole }: AnimatedParticlesProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && hoveredRole) {
      // Rotate entire particle system
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  if (!hoveredRole) return null

  const color = 
    hoveredRole === 'landowner' ? '#10b981' : 
    hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'

  return (
    <group ref={groupRef}>
      {/* Orbiting particles */}
      {[...Array(30)].map((_, i) => {
        const angle = (i / 30) * Math.PI * 2
        const radius = 4 + Math.sin(i * 0.5) * 0.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(i * 0.3) * 0.8
        
        return (
          <mesh key={`orbit-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Energy trails */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <group key={`trail-${i}`} rotation={[0, angle, 0]}>
            {[...Array(10)].map((_, j) => {
              const distance = 2.5 + j * 0.3
              return (
                <mesh
                  key={`trail-part-${j}`}
                  position={[distance, 0, 0]}
                >
                  <boxGeometry args={[0.08, 0.08, 0.08]} />
                  <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={1 - j * 0.1}
                  />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

