'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatDate, formatCurrency, getStatusColor, getStatusIcon } from '@/lib/utils'
import type { Certificate } from '@/types/database'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import CertificateRequestModal from '@/components/CertificateRequestModal'

export default function DashboardPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    fetchCertificates()
  }, [user])

  const fetchCertificates = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSuccess = () => {
    setShowRequestModal(false)
    fetchCertificates()
    toast({
      title: 'Request Submitted',
      description: 'Your certificate request has been submitted for review.',
    })
  }

  const handleDownloadPDF = async (certificate: Certificate) => {
    if (!certificate.pdf_final_url) {
      toast({
        title: 'PDF Not Available',
        description: 'Certificate PDF is not yet generated.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(certificate.pdf_final_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${certificate.certificate_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download certificate PDF.',
        variant: 'destructive',
      })
    }
  }

  const handleViewCertificate = (certificate: Certificate) => {
    router.push(`/certificates/${certificate.certificate_id}`)
  }

  const getStats = () => {
    const total = certificates.length
    const pending = certificates.filter(c => c.status === 'pending').length
    const approved = certificates.filter(c => c.status === 'approved').length
    const issued = certificates.filter(c => c.status === 'issued').length
    const rejected = certificates.filter(c => c.status === 'rejected').length

    return { total, pending, approved, issued, rejected }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation user={user} profile={profile} onLogin={() => {}} onGetStarted={() => {}} />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation user={user} profile={profile} onLogin={() => {}} onGetStarted={() => {}} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {profile?.full_name || user?.email}
              </h1>
              <p className="text-gray-400">
                Manage your Mars land certificates and track their status
              </p>
            </div>
            <Button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Certificate
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Certificates</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Issued</p>
                    <p className="text-2xl font-bold text-green-400">{stats.issued}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates List */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Your Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    No certificates yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Request your first Mars land certificate to get started
                  </p>
                  <Button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Certificate
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.map((certificate) => (
                    <div
                      key={certificate.id}
                      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-white mr-3">
                              {certificate.certificate_id}
                            </h3>
                            <Badge className={getStatusColor(certificate.status)}>
                              {getStatusIcon(certificate.status)} {certificate.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {certificate.land_coordinates}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              {formatCurrency(certificate.land_value)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(certificate.created_at)}
                            </div>
                          </div>

                          {certificate.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                              <div className="flex items-center text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Rejection Reason: {certificate.rejection_reason}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCertificate(certificate)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          
                          {certificate.status === 'issued' && certificate.pdf_final_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(certificate)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showRequestModal && (
        <CertificateRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  )
}

