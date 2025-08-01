'use client'

import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PayPalPaymentProps {
  certificateId: string
  amount: number
  currency?: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: any) => void
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  certificateId,
  amount,
  currency = 'USD',
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: currency,
    intent: 'capture',
    'data-client-token': undefined,
  }

  const createOrder = async () => {
    try {
      setLoading(true)
      
      // Create order in your backend
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificate_id: certificateId,
          amount: amount,
          currency: currency,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order')
      }

      return data.order_id
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      toast({
        title: 'Payment Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const onApprove = async (data: any) => {
    try {
      setLoading(true)

      // Capture the payment
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: data.orderID,
          certificate_id: certificateId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment')
      }

      // Record transaction in database
      const { error: dbError } = await supabase
        .from('payment_transactions')
        .insert({
          certificate_id: certificateId,
          payment_method: 'paypal',
          payment_id: data.orderID,
          amount: amount,
          currency: currency,
          status: 'completed',
          payment_data: {
            paypal_order_id: data.orderID,
            paypal_payer_id: data.payerID,
            capture_details: result.capture_details,
          },
        })

      if (dbError) {
        console.error('Error recording transaction:', dbError)
      }

      toast({
        title: 'Payment Successful!',
        description: 'Your Mars land certificate payment has been processed.',
        variant: 'default',
      })

      onSuccess?.(data.orderID)
    } catch (error) {
      console.error('Error capturing payment:', error)
      toast({
        title: 'Payment Error',
        description: 'Payment could not be completed. Please try again.',
        variant: 'destructive',
      })
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  const onErrorHandler = (error: any) => {
    console.error('PayPal error:', error)
    toast({
      title: 'Payment Error',
      description: 'An error occurred during payment. Please try again.',
      variant: 'destructive',
    })
    onError?.(error)
  }

  const onCancel = () => {
    toast({
      title: 'Payment Cancelled',
      description: 'Payment was cancelled. You can try again anytime.',
      variant: 'default',
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mars Land Certificate Payment
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Certificate ID:</span>
            <span className="font-mono">{certificateId}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 mt-2">
            <span>Total Amount:</span>
            <span>${amount} {currency}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            <strong>Payment Method:</strong> PayPal
          </div>
          <div className="text-sm text-gray-600">
            <strong>Merchant:</strong> tanloifmc@yahoo.com
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600">Processing payment...</span>
          </div>
        )}

        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancel}
            disabled={loading}
          />
        </PayPalScriptProvider>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Secure payment powered by PayPal</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  )
}

export default PayPalPayment

