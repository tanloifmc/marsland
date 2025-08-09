'use client'

import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei'
import { TextureLoader, Vector3 } from 'three'
import { motion } from 'framer-motion'
import LandPurchaseModal from './LandPurchaseModal'

interface LandPlot {
  id: string
  position: [number, number, number]
  isOwned: boolean
  owner?: string
  price: number
  coordinates: { lat: number; lng: number }
}

interface Mars3DViewerProps {
  onLandSelect?: (land: LandPlot) => void
  selectedLandId?: string
  showGrid?: boolean
}

// Mars Planet Component
function MarsPlanet({ onLandClick, selectedLandId, showGrid }: {
  onLandClick?: (land: LandPlot) => void
  selectedLandId?: string
  showGrid?: boolean
}) {
  const meshRef = useRef<any>()
  const [hovered, setHovered] = useState<string | null>(null)
  
  // Generate land plots on Mars surface
  const generateLandPlots = (): LandPlot[] => {
    const plots: LandPlot[] = []
    const radius = 2.01 // Slightly above Mars surface
    
    // Generate grid of land plots
    for (let lat = -80; lat <= 80; lat += 2) {
      for (let lng = -180; lng <= 180; lng += 2) {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lng + 180) * (Math.PI / 180)
        
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        
        const id = `MARS-${lat}-${lng}`
        plots.push({
          id,
          position: [x, y, z],
          isOwned: Math.random() > 0.7, // 30% owned
          owner: Math.random() > 0.7 ? `User${Math.floor(Math.random() * 1000)}` : undefined,
          price: Math.floor(Math.random() * 1000) + 100,
          coordinates: { lat, lng }
        })
      }
    }
    
    return plots.slice(0, 10000) // Limit to 10k for performance
  }

  const [landPlots] = useState<LandPlot[]>(generateLandPlots())

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 // Slow rotation
    }
  })

  return (
    <group>
      {/* Mars Planet */}
      <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#CD5C5C"
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>

      {/* Land Plots */}
      {showGrid && landPlots.map((plot) => (
        <group key={plot.id}>
          <mesh
            position={plot.position}
            onClick={() => onLandClick?.(plot)}
            onPointerOver={() => setHovered(plot.id)}
            onPointerOut={() => setHovered(null)}
          >
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial
              color={
                selectedLandId === plot.id
                  ? '#00ff00'
                  : hovered === plot.id
                  ? '#ffff00'
                  : plot.isOwned
                  ? '#ff4444'
                  : '#44ff44'
              }
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Land Info on Hover */}
          {hovered === plot.id && (
            <Html position={plot.position} center>
              <div className="bg-black/80 text-white p-2 rounded text-xs whitespace-nowrap">
                <div>ID: {plot.id}</div>
                <div>Price: ${plot.price}</div>
                <div>Status: {plot.isOwned ? 'Owned' : 'Available'}</div>
                {plot.owner && <div>Owner: {plot.owner}</div>}
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Mars Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#ff6b35"
        anchorX="center"
        anchorY="middle"
      >
        MARS LAND
      </Text>
    </group>
  )
}

// Loading Component
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-white">Loading Mars...</span>
      </div>
    </Html>
  )
}

// Main Mars 3D Viewer Component
export default function Mars3DViewer({ onLandSelect, selectedLandId, showGrid = true }: Mars3DViewerProps) {
  const [selectedLand, setSelectedLand] = useState<LandPlot | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchasedLands, setPurchasedLands] = useState<Set<string>>(new Set())

  const handleLandClick = (land: LandPlot) => {
    setSelectedLand(land)
    onLandSelect?.(land)
  }

  const handlePurchaseClick = () => {
    if (selectedLand && !selectedLand.isOwned) {
      setShowPurchaseModal(true)
    }
  }

  const handlePurchaseSuccess = (land: LandPlot, certificateId: string) => {
    setPurchasedLands(prev => new Set([...prev, land.id]))
    setShowPurchaseModal(false)
    // Update the selected land to show as owned
    if (selectedLand?.id === land.id) {
      setSelectedLand({
        ...selectedLand,
        isOwned: true,
        owner: 'You'
      })
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 2, 5], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #000011, #001122)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />

        {/* Mars Planet with Suspense */}
        <Suspense fallback={<LoadingFallback />}>
          <MarsPlanet
            onLandClick={handleLandClick}
            selectedLandId={selectedLandId}
            showGrid={showGrid}
          />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          autoRotate={false}
        />

        {/* Stars Background */}
        <mesh>
          <sphereGeometry args={[50, 32, 32]} />
          <meshBasicMaterial color="#000011" side={2} />
        </mesh>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white"
        >
          <h3 className="text-lg font-bold text-orange-400 mb-2">Mars Land Explorer</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Available Land</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>Owned Land</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Hovered</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Selected Land Info */}
      {selectedLand && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs"
        >
          <h4 className="text-lg font-bold text-orange-400 mb-2">Selected Land</h4>
          <div className="space-y-2 text-sm">
            <div><strong>ID:</strong> {selectedLand.id}</div>
            <div><strong>Coordinates:</strong> {selectedLand.coordinates.lat}°, {selectedLand.coordinates.lng}°</div>
            <div><strong>Price:</strong> ${selectedLand.price}</div>
            <div><strong>Status:</strong> 
              <span className={`ml-1 ${selectedLand.isOwned ? 'text-red-400' : 'text-green-400'}`}>
                {selectedLand.isOwned ? 'Owned' : 'Available'}
              </span>
            </div>
            {selectedLand.owner && (
              <div><strong>Owner:</strong> {selectedLand.owner}</div>
            )}
            {!selectedLand.isOwned && (
              <button 
                onClick={handlePurchaseClick}
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition-colors"
              >
                Purchase Land
              </button>
            )}
            {selectedLand.isOwned && (
              <div className="w-full mt-3 bg-green-500/20 border border-green-500/40 text-green-400 py-2 px-4 rounded text-center">
                {selectedLand.owner === 'You' ? 'Owned by You' : `Owned by ${selectedLand.owner}`}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs"
        >
          <div><strong>Controls:</strong></div>
          <div>• Left click + drag: Rotate</div>
          <div>• Right click + drag: Pan</div>
          <div>• Scroll: Zoom</div>
          <div>• Click land plots to select          </div>
        </motion.div>
      </div>

      {/* Land Purchase Modal */}
      <LandPurchaseModal
        land={selectedLand}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}