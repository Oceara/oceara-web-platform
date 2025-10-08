'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  description: string;
  carbonStored?: number;
  area?: number;
  type: 'mangrove' | 'wetland' | 'seagrass';
}

interface GlobeProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
  selectedHotspot?: Hotspot | null;
}

const GlobeMesh: React.FC<GlobeProps> = ({ hotspots, onHotspotClick, selectedHotspot }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const markerGroupRef = useRef<THREE.Group>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);

  // Load textures
  const [dayTexture, setDayTexture] = useState<THREE.Texture | null>(null);
  const [nightTexture, setNightTexture] = useState<THREE.Texture | null>(null);
  const [cloudsTexture, setCloudsTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    loader.load('/static/earth/day.jpg', (texture) => {
      setDayTexture(texture);
    });
    
    loader.load('/static/earth/night.jpg', (texture) => {
      setNightTexture(texture);
    });
    
    loader.load('/static/earth/specularClouds.jpg', (texture) => {
      setCloudsTexture(texture);
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });

  const latLonToVector3 = (lat: number, lon: number, radius: number = 1.01) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const createHotspotMarker = (hotspot: Hotspot) => {
    const position = latLonToVector3(hotspot.lat, hotspot.lon);
    
    return (
      <group key={hotspot.id} position={position}>
        <mesh
          onClick={() => onHotspotClick(hotspot)}
          onPointerOver={() => setHoveredHotspot(hotspot)}
          onPointerOut={() => setHoveredHotspot(null)}
        >
          <sphereGeometry args={[0.014, 16, 16]} />
          <meshBasicMaterial 
            color={selectedHotspot?.id === hotspot.id ? "#ff6b6b" : "#ff4444"} 
            transparent
            opacity={0.8}
          />
        </mesh>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                position.x, position.y, position.z,
                position.x * 1.04, position.y * 1.04, position.z * 1.04
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff4444" />
        </line>
      </group>
    );
  };

  if (!dayTexture || !nightTexture || !cloudsTexture) {
    return null;
  }

  return (
    <group>
      {/* Earth Globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={dayTexture}
          bumpMap={nightTexture}
          bumpScale={0.1}
          specularMap={cloudsTexture}
          shininess={100}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.02, 32, 32]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Hotspot Markers */}
      <group ref={markerGroupRef}>
        {hotspots.map(createHotspotMarker)}
      </group>

      {/* Tooltip */}
      {hoveredHotspot && (
        <Html position={latLonToVector3(hoveredHotspot.lat, hoveredHotspot.lon, 1.1)}>
          <div className="bg-carbon-800 text-white p-3 rounded-lg shadow-lg max-w-xs border border-ocean-500">
            <h3 className="font-semibold text-ocean-300">{hoveredHotspot.name}</h3>
            <p className="text-sm mt-1">{hoveredHotspot.description}</p>
            {hoveredHotspot.carbonStored && (
              <p className="text-xs mt-2 text-green-400">
                Carbon Stored: {hoveredHotspot.carbonStored.toLocaleString()} tons
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

const Globe: React.FC<GlobeProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <GlobeMesh {...props} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            minDistance={2}
            maxDistance={5}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Globe;
