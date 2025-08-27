
'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  MapPin,
  Building,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  Crown,
  Rocket
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { LandPlot } from "@/types/land"
import BuildingEditor from "@/components/BuildingEditor"







interface Building {
  id: string
  land_id: string
  owner_id: string
  building_type: string
  name: string
  description: string
  grid_position: any
  model_url?: string
  thumbnail_url?: string
  is_public: boolean
  created_at: string
  updated_at?: string
}

interface Certificate {
  id: string
  certificate_id: string
  land_id: string
  status: string
  verification_hash: string
  issued_at: string
  pdf_url: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ownedLands, setOwnedLands] = useState<LandPlot[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedLand, setSelectedLand] = useState<LandPlot | null>(null)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'lands' | 'buildings' | 'certificates'
  >('overview')
  const [loading, setLoading] = useState(true)
  const [showBuildingEditor, setShowBuildingEditor] = useState(false)
  const [buildingToEdit, setBuildingToEdit] = useState<Building | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await loadUserData(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Load owned lands
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_owned', true)
        .order('purchased_at', { ascending: false })

      if (landsError) throw landsError
      setOwnedLands(lands || [])

      // Load buildings
      const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (buildingsError) throw buildingsError
      setBuildings(buildingsData || [])

      // Load certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificates')
        .select('*')
        .eq('owner_id', userId)
        .order('issued_at', { ascending: false })

      if (certificatesError) throw certificatesError
      setCertificates(certificatesData || [])

    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleBuildOnLand = (land: LandPlot) => {
    setSelectedLand(land)
    setBuildingToEdit(null) // Clear any previous building selection
    setShowBuildingEditor(true)
  }

  const handleEditBuilding = (building: Building) => {
    const land = ownedLands.find(l => l.id === building.land_id)
    if (land) {
      setSelectedLand(land)
      setBuildingToEdit(building)
      setShowBuildingEditor(true)
    }
  }

  const handleSaveBuilding = (newBuilding: any) => {
    // Chuẩn hóa dữ liệu nhận từ BuildingEditor (BuildingData) sang kiểu Building dùng trong state
    const normalized: Building = {
      id: newBuilding.id,
      land_id: newBuilding.land_id,
      owner_id: newBuilding.owner_id,
      building_type: newBuilding.building_type,
      name: newBuilding.name,
      description: newBuilding.description,
      grid_position: newBuilding.grid_position,
      model_url: newBuilding.model_url ?? undefined,
      thumbnail_url: newBuilding.thumbnail_url ?? undefined,
      is_public: newBuilding.is_public ?? true,
      created_at: newBuilding.created_at ?? new Date().toISOString(),
      updated_at: newBuilding.updated_at ?? undefined,
    }

    // Cập nhật danh sách buildings
    setBuildings(prev => {
      const existingIndex = prev.findIndex(b => b.id === normalized.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = normalized
        return updated
      } else {
        return [normalized, ...prev]
      }
    })
    setShowBuildingEditor(false)
    setSelectedLand(null)
    setBuildingToEdit(null)
  }

  const handleViewCertificate = (certificate: Certificate) => {
    // TODO: Open certificate viewer
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, '_blank')
    } else {
      alert('PDF URL not available yet.')
    }
  }

  const handleDownloadCertificate = (certificate: Certificate) => {
    // TODO: Download PDF certificate
    if (certificate.pdf_url) {
      const link = document.createElement('a')
      link.href = certificate.pdf_url
      link.download = `MarsLand_Certificate_${certificate.certificate_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('PDF URL not available for download yet.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your Mars empire...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <Rocket className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">Please sign in to access your Mars Land dashboard.</p>
          <a
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Mars Land Dashboard</h1>
                <p className="text-gray-300">Welcome back, {user.email}</p>
              </div>
            </div>
            <a
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Back to Mars
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'lands', label: 'My Lands', icon: MapPin },
            { id: 'buildings', label: 'Buildings', icon: Building },
            { id: 'certificates', label: 'Certificates', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Owned Lands</p>
                    <p className="text-3xl font-bold text-white">{ownedLands.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Buildings</p>
                    <p className="text-3xl font-bold text-white">{buildings.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Certificates</p>
                    <p className="text-3xl font-bold text-white">{certificates.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Value</p>
                    <p className="text-3xl font-bold text-white">
                      ${ownedLands.reduce((sum, land) => sum + land.price, 0)}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {ownedLands.slice(0, 3).map((land) => (
                  <div key={land.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-white font-semibold">Purchased {land.land_id}</p>
                        <p className="text-gray-300 text-sm">
                          {land.purchased_at ? new Date(land.purchased_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">${land.price}</span>
                  </div>
                ))}
                {ownedLands.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No land purchases yet</p>
                    <a
                      href="/"
                      className="text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Explore Mars to buy your first land
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* My Lands Tab */}
        {activeTab === 'lands' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Mars Lands</h2>
              <a
                href="/"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Buy More Land</span>
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedLands.map((land) => (
                <div key={land.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{land.land_id}</h3>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                      Owned
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coordinates:</span>
                      <span className="text-white">{land.latitude}°, {land.longitude}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchase Price:</span>
                      <span className="text-green-400 font-bold">${land.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchased:</span>
                      <span className="text-white">
                        {land.purchased_at ? new Date(land.purchased_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBuildOnLand(land)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Building className="h-4 w-4" />
                      <span>Build</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {ownedLands.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Lands Owned</h3>
                <p className="text-gray-400 mb-6">
                  Start your Mars colonization journey by purchasing your first land plot.
                </p>
                <a
                  href="/"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <Rocket className="h-5 w-5" />
                  <span>Explore Mars</span>
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* Buildings Tab */}
        {activeTab === 'buildings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Buildings</h2>
              <button
                onClick={() => {
                  if (ownedLands.length > 0) {
                    setSelectedLand(ownedLands[0]) // Select the first owned land by default
                    setBuildingToEdit(null)
                    setShowBuildingEditor(true)
                  } else {
                    alert('You need to own land before you can build!')
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Building</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildings.map((building) => (
                <div key={building.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="aspect-video bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {building.thumbnail_url ? (
                      <img 
                        src={building.thumbnail_url} 
                        alt={building.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{building.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{building.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                      {building.building_type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      building.is_public 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {building.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditBuilding(building)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      <Edit className="h-4 w-4 mx-auto" />
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {buildings.length === 0 && (
              <div className="text-center py-16">
                <Building className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Buildings Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start building on your Mars lands to create your colony.
                </p>
                {ownedLands.length > 0 ? (
                  <button
                    onClick={() => {
                      setSelectedLand(ownedLands[0])
                      setBuildingToEdit(null)
                      setShowBuildingEditor(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Start Building</span>
                  </button>
                ) : (
                  <a
                    href="/"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <MapPin className="h-5 w-5" />
                    <span>Buy Land First</span>
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">My Certificates</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{certificate.certificate_id}</h3>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                      {certificate.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issued:</span>
                      <span className="text-white">
                        {new Date(certificate.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verification:</span>
                      <span className="text-blue-400 font-mono text-xs">
                        {certificate.verification_hash.substring(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewCertificate(certificate)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {certificates.length === 0 && (
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Certificates</h3>
                <p className="text-gray-400 mb-6">
                  Certificates will appear here after you purchase Mars land.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Building Editor Modal */}
      {showBuildingEditor && selectedLand && user && (
        <BuildingEditor
          land={selectedLand}
          user={user}
          isOpen={showBuildingEditor}
          onClose={() => setShowBuildingEditor(false)}
          onSave={handleSaveBuilding}
          initialBuilding={buildingToEdit}
        />
      )}
    </div>
  )
}


