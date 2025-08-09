'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, DollarSign, Globe, CheckCircle, AlertCircle } from 'lucide-react'
import PayPalPayment from './PayPalPayment'

interface LandPlot {
  id: string
  land_id: string
  latitude: number
  longitude: number
  price: number
  coordinates: { lat: number; lng: number }
  position: [number, number, number]
  isOwned: boolean
  owner?: string
}

interface LandPurchaseModalProps {
  land: LandPlot | null
  isOpen: boolean
  onClose: () => void
  onPurchaseSuccess: (land: LandPlot, certificateId: string) => void
}

export default function LandPurchaseModal({ 
  land, 
  isOpen, 
  onClose, 
  onPurchaseSuccess 
}: LandPurchaseModalProps) {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'success' | 'error'>('details')
  const [purchaseResult, setPurchaseResult] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    // In a real app, you would get the certificate data from the API response
    const mockCertificateId = `CERT-MARS-${Date.now()}`
    setPurchaseResult({
      paymentId,
      orderId,
      certificateId: mockCertificateId,
    })
    setCurrentStep('success')
    
    if (land) {
      onPurchaseSuccess(land, mockCertificateId)
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    setErrorMessage(error.message || 'Payment failed')
    setCurrentStep('error')
  }

  const handlePaymentCancel = () => {
    setCurrentStep('details')
  }

  const resetModal = () => {
    setCurrentStep('details')
    setPurchaseResult(null)
    setErrorMessage('')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!land) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {currentStep === 'details' && 'Purchase Mars Land'}
                {currentStep === 'payment' && 'Complete Payment'}
                {currentStep === 'success' && 'Purchase Successful!'}
                {currentStep === 'error' && 'Purchase Failed'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Land Details */}
              {currentStep === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Land Preview */}
                  <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl p-6 border border-orange-500/20">
                    <div className="flex items-center mb-4">
                      <Globe className="h-6 w-6 text-orange-500 mr-2" />
                      <h3 className="text-xl font-semibold text-white">Land Details</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-orange-400 mr-2" />
                          <span className="text-gray-300">Land ID:</span>
                          <span className="text-white font-semibold ml-2">{land.land_id}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-300">Coordinates:</span>
                          <span className="text-white ml-2">{land.latitude}°, {land.longitude}°</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-300">3D Position:</span>
                          <span className="text-white ml-2 font-mono text-sm">
                            [{land.position[0].toFixed(2)}, {land.position[1].toFixed(2)}, {land.position[2].toFixed(2)}]
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-400 mr-2" />
                          <span className="text-gray-300">Price:</span>
                          <span className="text-green-400 font-bold text-lg ml-2">${land.price} USD</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-300">Status:</span>
                          <span className="text-green-400 ml-2">Available</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-300">Size:</span>
                          <span className="text-white ml-2">1 Mars Plot (100m²)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What You Get */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">What You Get:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        'Digital ownership certificate',
                        'QR code verification',
                        'Building rights on your land',
                        'Mars community membership',
                        'NFT-ready ownership',
                        'Exclusive land coordinates'
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                      <strong>Important:</strong> This is a virtual land ownership for entertainment purposes. 
                      You will receive a digital certificate and building rights within the Mars Land platform.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition-all font-semibold"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <PayPalPayment
                    land={land}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                  />
                </motion.div>
              )}

              {/* Step 3: Success */}
              {currentStep === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Congratulations!
                  </h3>
                  <p className="text-xl text-gray-300 mb-6">
                    You are now the proud owner of Mars land plot {land.land_id}!
                  </p>
                  
                  <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left">
                    <h4 className="text-lg font-semibold text-white mb-4">Purchase Summary:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Land ID:</span>
                        <span className="text-white font-semibold">{land.land_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Coordinates:</span>
                        <span className="text-white">{land.latitude}°, {land.longitude}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount Paid:</span>
                        <span className="text-green-400 font-bold">${land.price} USD</span>
                      </div>
                      {purchaseResult && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Payment ID:</span>
                            <span className="text-white font-mono text-xs">{purchaseResult.paymentId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Certificate ID:</span>
                            <span className="text-white font-mono text-xs">{purchaseResult.certificateId}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <p className="text-blue-300 text-sm">
                      Your digital certificate will be generated and sent to your email within a few minutes. 
                      You can now start building on your Mars land!
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-8 rounded-lg transition-all font-semibold"
                  >
                    Start Building
                  </button>
                </motion.div>
              )}

              {/* Step 4: Error */}
              {currentStep === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Purchase Failed
                  </h3>
                  <p className="text-xl text-gray-300 mb-6">
                    We couldn't complete your purchase. Please try again.
                  </p>
                  
                  {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleClose}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setCurrentStep('details')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition-all font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

