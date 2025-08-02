// frontend/components/AppProviders.tsx
'use client'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: 'USD',
    intent: 'capture',
  }
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PayPalScriptProvider>
  )
}
