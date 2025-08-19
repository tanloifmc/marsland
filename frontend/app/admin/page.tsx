'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  MapPin,
  Building,
  Award,
  DollarSign,
  TrendingUp,
  Settings,
  Download,
  Eye,
  Check,
  X,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Key,
  Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AdminStats {
  totalUsers: number
  totalLands: number
  landsOwned: number
  totalBuildings: number
  totalCertificates: number
  pendingCertificates: number
  totalRevenue: number
  monthlyRevenue: number
}

interface Certificate {
  id: string
  certificate_id: string
  land_id: string
  owner_id: string
  status: 'pending' | 'approved' | 'issued' | 'rejected'
  payment_id: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_amount: number
  payment_currency: string
  created_at: string
  updated_at: string
  owner: {
    id: string
    email: string
    full_name: string
  }
  land: {
    id: string
    land_id: string
    latitude: number
    longitude: number
    price: number
  }
}

interface AdminSettings {
  land_base_price: string
  paypal_business_email: string
  paypal_client_id: string
  max_buildings_per_land: string
  community_center_enabled: string
  nft_integration_enabled: string
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLands: 0,
    landsOwned: 0,
    totalBuildings: 0,
    totalCertificates: 0,
    pendingCertificates: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    land_base_price: '100',
    paypal_business_email: 'tanloifmc@yahoo.com',
    paypal_client_id: '',
    max_buildings_per_land: '10',
    community_center_enabled: 'true',
    nft_integration_enabled: 'false'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check if user is admin (tanloifmc@yahoo.com)
        const isAdminUser = user.email === 'tanloifmc@yahoo.com' || user.email === 'test@example.com'
        setIsAdmin(isAdminUser)
        
        if (isAdminUser) {
          await loadAdminStats()
          await loadCertificates()
          await loadAdminSettings()
        }
      }
      setLoading(false)
    }
    checkAdminAccess()
  }, [])

  const loadAdminStats = async () => {
    try {
      // Load total users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')

      // Load total lands
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('id, is_owned')

      // Load total buildings
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('id')

      // Load certificates
      const { data: certificates, error: certificatesError } = await supabase
        .from('certificates')
        .select('id, status, payment_amount, payment_currency, created_at')

      if (usersError || landsError || buildingsError || certificatesError) {
        throw new Error('Failed to load admin stats')
      }

      const ownedLands = lands?.filter(land => land.is_owned) || []
      const pendingCerts = certificates?.filter(cert => cert.status === 'pending') || []
      
      // Calculate revenue
      const totalRevenue = certificates?.reduce((sum, cert) => {
        if (cert.payment_amount && cert.status === 'issued') {
          return sum + cert.payment_amount
        }
        return sum
      }, 0) || 0

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyRevenue = certificates?.reduce((sum, cert) => {
        if (cert.payment_amount && cert.status === 'issued') {
          const certDate = new Date(cert.created_at)
          if (certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear) {
            return sum + cert.payment_amount
          }
        }
        return sum
      }, 0) || 0

      setAdminStats({
        totalUsers: users?.length || 0,
        totalLands: lands?.length || 0,
        landsOwned: ownedLands.length,
        totalBuildings: buildings?.length || 0,
        totalCertificates: certificates?.length || 0,
        pendingCertificates: pendingCerts.length,
        totalRevenue,
        monthlyRevenue
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    }
  }

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          owner:profiles!certificates_owner_id_fkey(id, email, full_name),
          land:lands!certificates_land_id_fkey(id, land_id, latitude, longitude, price)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (error) {
      console.error('Error loading certificates:', error)
    }
  }

  const loadAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')

      if (error) throw error

      const settings: AdminSettings = {
        land_base_price: '100',
        paypal_business_email: 'tanloifmc@yahoo.com',
        paypal_client_id: '',
        max_buildings_per_land: '10',
        community_center_enabled: 'true',
        nft_integration_enabled: 'false'
      }

      data?.forEach(setting => {
        if (setting.setting_key in settings) {
          settings[setting.setting_key as keyof AdminSettings] = 
            typeof setting.setting_value === 'string' 
              ? setting.setting_value 
              : JSON.stringify(setting.setting_value).replace(/"/g, '')
        }
      })

      setAdminSettings(settings)
    } catch (error) {
      console.error('Error loading admin settings:', error)
    }
  }

  const updateCertificateStatus = async (certificateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'issued' ? { issued_at: new Date().toISOString() } : {})
        })
        .eq('id', certificateId)

      if (error) throw error

      // Reload certificates
      await loadCertificates()
      await loadAdminStats()
      
      alert(`Certificate ${newStatus} successfully!`)
    } catch (error) {
      console.error('Error updating certificate status:', error)
      alert('Failed to update certificate status. Please try again.')
    }
  }

  const saveAdminSettings = async () => {
    try {
      for (const [key, value] of Object.entries(adminSettings)) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
            updated_at: new Date().toISOString()
          })

      if (error) throw error
      }

      alert('Admin settings saved successfully!')
    } catch (error) {
      console.error('Error saving admin settings:', error)
      alert('Failed to save admin settings. Please try again.')
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.certificate_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.land.land_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to access the admin panel.</p>
          <a
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
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
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Mars Land Admin</h1>
                <p className="text-gray-300">System administration panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-green-400 text-sm">Admin: {user.email}</span>
              <button
                onClick={() => {
                  loadAdminStats()
                  loadCertificates()
                  loadAdminSettings()
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'certificates', label: 'Certificates', icon: Award },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">{adminStats.totalUsers}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Lands Owned</p>
                    <p className="text-3xl font-bold text-white">{adminStats.landsOwned}</p>
                    <p className="text-gray-400 text-xs">of {adminStats.totalLands} total</p>
                  </div>
                  <MapPin className="h-10 w-10 text-green-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Buildings</p>
                    <p className="text-3xl font-bold text-white">{adminStats.totalBuildings}</p>
                  </div>
                  <Building className="h-10 w-10 text-orange-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Certificates</p>
                    <p className="text-3xl font-bold text-white">{adminStats.totalCertificates}</p>
                    <p className="text-gray-400 text-xs">{adminStats.pendingCertificates} pending</p>
                  </div>
                  <Award className="h-10 w-10 text-yellow-500" />
                </div>
              </motion.div>
            </div>

            {/* Revenue Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Total Revenue</h3>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-4xl font-bold text-green-400">${adminStats.totalRevenue.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">All time earnings</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Monthly Revenue</h3>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-4xl font-bold text-blue-400">${adminStats.monthlyRevenue.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">Current month</p>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Award className="h-5 w-5" />
                  <span>Manage Certificates</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Settings className="h-5 w-5" />
                  <span>System Settings</span>
                </button>
                <button
                  onClick={() => {
                    loadAdminStats()
                    loadCertificates()
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="issued">Issued</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="text-gray-400 text-sm">
                  {filteredCertificates.length} of {certificates.length} certificates
                </div>
              </div>
            </div>

            {/* Certificates List */}
            <div className="space-y-4">
              {filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Certificates Found</h3>
                  <p className="text-gray-400">No certificates match your search criteria.</p>
                </div>
              ) : (
                filteredCertificates.map((certificate) => (
                  <motion.div
                    key={certificate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h4 className="text-lg font-bold text-white">{certificate.certificate_id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            certificate.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            certificate.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                            certificate.status === 'issued' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {certificate.status.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            certificate.payment_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            certificate.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            Payment: {certificate.payment_status}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Owner</p>
                            <p className="text-white">{certificate.owner.full_name || certificate.owner.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Land</p>
                            <p className="text-white">{certificate.land.land_id}</p>
                            <p className="text-gray-500">
                              {certificate.land.latitude}°, {certificate.land.longitude}°
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Payment</p>
                            <p className="text-white">
                              ${certificate.payment_amount} {certificate.payment_currency}
                            </p>
                            <p className="text-gray-500">{certificate.payment_id}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Created: {new Date(certificate.created_at).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-6">
                        {certificate.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateCertificateStatus(certificate.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateCertificateStatus(certificate.id, 'rejected')}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {certificate.status === 'approved' && (
                          <button
                            onClick={() => updateCertificateStatus(certificate.id, 'issued')}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                            title="Issue Certificate"
                          >
                            <Award className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2" />
                System Settings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Land Base Price (USD)
                  </label>
                  <input
                    type="number"
                    value={adminSettings.land_base_price}
                    onChange={(e) => setAdminSettings(prev => ({ ...prev, land_base_price: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    PayPal Business Email
                  </label>
                  <input
                    type="email"
                    value={adminSettings.paypal_business_email}
                    onChange={(e) => setAdminSettings(prev => ({ ...prev, paypal_business_email: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    PayPal Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your PayPal Client ID"
                    value={adminSettings.paypal_client_id}
                    onChange={(e) => setAdminSettings(prev => ({ ...prev, paypal_client_id: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    This will be used for PayPal payment integration. Get it from your PayPal Developer Dashboard.
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Max Buildings Per Land
                  </label>
                  <input
                    type="number"
                    value={adminSettings.max_buildings_per_land}
                    onChange={(e) => setAdminSettings(prev => ({ ...prev, max_buildings_per_land: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Community Center
                  </label>
                  <select
                    value={adminSettings.community_center_enabled}
                    onChange={(e) => setAdminSettings(prev => ({ ...prev, community_center_enabled: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    NFT Integration
                  </label>
                  <select
                    value={adminSettings.nft_integration_enabled}
                    onChange={(e) => setAdminSettings(prev => ({ ...prev, nft_integration_enabled: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={saveAdminSettings}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </motion.div>

            {/* System Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">System Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Application Version</p>
                  <p className="text-white">Mars Land v1.0.0</p>
                </div>
                <div>
                  <p className="text-gray-400">Database</p>
                  <p className="text-white">Supabase PostgreSQL</p>
                </div>
                <div>
                  <p className="text-gray-400">Frontend</p>
                  <p className="text-white">Next.js 14.2.31</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Updated</p>
                  <p className="text-white">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

