'use client'

import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { motion } from 'framer-motion'
import { LandPlot } from "@/types/land"



interface PayPalPaymentProps {
  land: LandPlot
  onSuccess: (paymentId: string, orderId: string) => void
  onError: (error: any) => void
  onCancel: () => void
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'
const PAYPAL_BUSINESS_EMAIL = 'tanloifmc@yahoo.com'

export default function PayPalPayment({ land, onSuccess, onError, onCancel }: PayPalPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const createOrder = async () => {
    try {
      setIsProcessing(true)
      setPaymentStatus('processing')

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          land_id: land.id,
          amount: land.price.toString(),
          currency: 'USD',
          description: `Mars Land Plot ${land.land_id} - Coordinates: ${land.latitude}°, ${land.longitude}°`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create PayPal order')
      }

      const data = await response.json()
      return data.orderID
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      setPaymentStatus('error')
      setErrorMessage('Failed to create payment order')
      onError(error)
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      setPaymentStatus('processing')

      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          land_id: land.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to capture PayPal payment')
      }

      const result = await response.json()
      
      if (result.status === 'COMPLETED') {
        setPaymentStatus('success')
        onSuccess(result.paymentID, data.orderID)
      } else {
        throw new Error('Payment not completed')
      }
    } catch (error) {
      console.error('Error capturing PayPal payment:', error)
      setPaymentStatus('error')
      setErrorMessage('Payment capture failed')
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const onErrorHandler = (error: any) => {
    console.error('PayPal payment error:', error)
    setPaymentStatus('error')
    setErrorMessage('Payment failed')
    setIsProcessing(false)
    onError(error)
  }

  const onCancelHandler = () => {
    setPaymentStatus('idle')
    setIsProcessing(false)
    onCancel()
  }

  if (paymentStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-300 mb-4">
          Your Mars land purchase has been completed successfully.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-400 mb-2">Land Details:</div>
          <div className="text-white font-semibold">{land.land_id}</div>
          <div className="text-gray-300">Coordinates: {land.latitude}°, {land.longitude}°</div>
          <div className="text-orange-400 font-bold">${land.price} USD</div>
        </div>
        <p className="text-sm text-gray-400">
          Your certificate will be generated and sent to your email shortly.
        </p>
      </motion.div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
        <p className="text-gray-300 mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            setPaymentStatus('idle')
            setErrorMessage('')
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Land Details */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
          Purchase Summary
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Land ID:</span>
            <span className="text-white font-semibold">{land.land_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Coordinates:</span>
            <span className="text-white">{land.latitude}°, {land.longitude}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Price:</span>
            <span className="text-orange-400 font-bold text-lg">${land.price} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Method:</span>
            <span className="text-white">PayPal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Merchant:</span>
            <span className="text-white">{PAYPAL_BUSINESS_EMAIL}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center text-blue-400 text-sm">
            <Shield className="h-4 w-4 mr-2" />
            Secure payment powered by PayPal
          </div>
        </div>
      </div>

      {/* PayPal Payment */}
      <div className="bg-gray-900 rounded-xl p-6 border border-orange-500/20">
        <h4 className="text-lg font-semibold text-white mb-4">Complete Payment</h4>
        
        {paymentStatus === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Processing payment...</p>
          </div>
        )}

        {paymentStatus === 'idle' && (
          <PayPalScriptProvider
            options={{
              clientId: PAYPAL_CLIENT_ID,
              currency: 'USD',
              intent: 'capture',
            }}
          >
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 45,
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onErrorHandler}
              onCancel={onCancelHandler}
              disabled={isProcessing}
            />
          </PayPalScriptProvider>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
          You will receive a digital certificate of ownership for your Mars land plot.
        </div>
      </div>

      {/* What You Get */}
      <div className="mt-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-3">What You Get:</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
            Digital certificate with QR code verification
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
            Exclusive access to build on your land
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
            Mars community membership
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
            NFT-ready ownership (coming soon)
          </li>
        </ul>
      </div>
    </div>
  )
}

