'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

interface RealisticEarthProps {
  hoveredRole?: string | null
}

function Earth({ hoveredRole }: { hoveredRole: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Load textures
  const [dayTexture, nightTexture, cloudsTexture] = useLoader(THREE.TextureLoader, [
    '/earth/day.jpg',
    '/earth/night.jpg',
    '/earth/specularClouds.jpg'
  ])

  // Shader material for day/night cycle
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(5, 0, 1).normalize() },
        atmosphereColor: { value: new THREE.Color(
          hoveredRole === 'landowner' ? 0x10b981 : 
          hoveredRole === 'buyer' ? 0x3b82f6 : 
          hoveredRole === 'admin' ? 0xa855f7 : 0x4fc3f7
        )}
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        uniform vec3 atmosphereColor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          
          // Day and night textures
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Sun intensity
          float sunIntensity = max(0.0, dot(normal, sunDirection));
          
          // Mix day and night
          vec4 color = mix(nightColor, dayColor, smoothstep(0.0, 0.5, sunIntensity));
          
          // Fresnel effect for atmosphere
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDirection)), 3.0);
          vec3 atmosphere = atmosphereColor * fresnel * 0.5;
          
          // Specular highlight
          vec3 reflectDirection = reflect(-sunDirection, normal);
          float specular = pow(max(0.0, dot(reflectDirection, viewDirection)), 32.0);
          
          gl_FragColor = vec4(color.rgb + atmosphere + vec3(specular * 0.5), 1.0);
        }
      `
    })
  }, [dayTexture, nightTexture, hoveredRole])

  // Update atmosphere color on hover
  useMemo(() => {
    if (earthMaterial.uniforms.atmosphereColor) {
      earthMaterial.uniforms.atmosphereColor.value = new THREE.Color(
        hoveredRole === 'landowner' ? 0x10b981 : 
        hoveredRole === 'buyer' ? 0x3b82f6 : 
        hoveredRole === 'admin' ? 0xa855f7 : 0x4fc3f7
      )
    }
  }, [hoveredRole, earthMaterial])

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Continuous rotation
      meshRef.current.rotation.y += delta * 0.05
      
      // Interactive effects
      if (hoveredRole) {
        // Faster rotation on hover
        meshRef.current.rotation.y += delta * 0.1
        
        // Scale up
        const targetScale = 2.8
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
        
        // Wobble effect
        meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.1
        meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 1.5) * 0.1
      } else {
        // Return to normal
        const targetScale = 2.2
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.1)
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1)
      }
    }

    // Rotate clouds independently
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.03
    }

    // Pulse atmosphere on hover
    if (atmosphereRef.current && hoveredRole) {
      const scale = 2.9 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      atmosphereRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group>
      {/* Main Earth */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={2.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color={
            hoveredRole === 'landowner' ? '#10b981' : 
            hoveredRole === 'buyer' ? '#3b82f6' : 
            hoveredRole === 'admin' ? '#a855f7' : '#4fc3f7'
          }
          transparent
          opacity={hoveredRole ? 0.15 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Particles on hover */}
      {hoveredRole && (
        <>
          {[...Array(30)].map((_, i) => {
            const angle = (i / 30) * Math.PI * 2
            const radius = 3
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            const z = Math.sin(angle * 3) * 0.5
            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial
                  color={
                    hoveredRole === 'landowner' ? '#10b981' : 
                    hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
                  }
                />
              </mesh>
            )
          })}
        </>
      )}

      {/* Glowing ring */}
      {hoveredRole && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.02, 16, 100]} />
          <meshBasicMaterial
            color={
              hoveredRole === 'landowner' ? '#10b981' : 
              hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
            }
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  )
}

export default function RealisticEarth({ hoveredRole }: RealisticEarthProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#4fc3f7" />
      
      {/* Extra lights on hover */}
      {hoveredRole && (
        <>
          <pointLight
            position={[0, 0, 4]}
            intensity={2}
            color={
              hoveredRole === 'landowner' ? '#10b981' : 
              hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
            }
            distance={10}
          />
          <spotLight
            position={[8, 8, 8]}
            angle={0.5}
            penumbra={1}
            intensity={1}
            castShadow
          />
        </>
      )}
      
      <Earth hoveredRole={hoveredRole || null} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
      
      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </Canvas>
  )
}

