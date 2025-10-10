'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'

interface Project {
  id: number
  name: string
  location: string
  coordinates: { lat: number; lng: number }
  creditsAvailable: number
  pricePerCredit: number
  image: string
}

function latLongToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

function ProjectMarker({ project, position }: { project: Project; position: THREE.Vector3 }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      {/* Marker Pin */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#10b981' : '#3b82f6'}
          emissive={hovered ? '#10b981' : '#3b82f6'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Pulsing Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.025, 0.035, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
      </mesh>

      {/* Info Card on Hover */}
      {hovered && (
        <Html distanceFactor={2}>
          <div className="bg-slate-900/95 backdrop-blur-lg rounded-lg p-4 border border-blue-500 shadow-2xl min-w-[250px]">
            <div className="text-2xl mb-2">{project.image}</div>
            <h3 className="text-white font-bold text-lg mb-1">{project.name}</h3>
            <p className="text-gray-300 text-sm mb-3">{project.location}</p>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-400 text-xs">Credits</div>
                <div className="text-white font-semibold">{project.creditsAvailable}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Price</div>
                <div className="text-blue-400 font-semibold">${project.pricePerCredit}</div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function Earth({ projects }: { projects: Project[] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Earth Sphere */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#0ea5e9"
          roughness={0.7}
          metalness={0.3}
        />
      </Sphere>

      {/* Project Markers */}
      {projects.map((project) => {
        const position = latLongToVector3(
          project.coordinates.lat,
          project.coordinates.lng,
          1.02
        )
        return <ProjectMarker key={project.id} project={project} position={position} />
      })}

      {/* Atmosphere Glow */}
      <Sphere args={[1.1, 64, 64]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

export default function EarthWithProjects({ projects }: { projects: Project[] }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#60a5fa" />
      
      <Earth projects={projects} />
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
      
      {/* Stars Background */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#000510" side={THREE.BackSide} />
      </mesh>
    </Canvas>
  )
}

