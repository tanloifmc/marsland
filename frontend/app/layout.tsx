import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mars Land Certificate System - Own Your Piece of the Red Planet',
  description: 'Professional Mars land ownership certificate system with blockchain integration, QR code verification, and NFT-ready features. Secure your piece of Mars today!',
  keywords: 'Mars land, certificate, blockchain, NFT, space ownership, Mars property, land certificate, verification',
  authors: [{ name: 'Mars Land Certificate System' }],
  creator: 'Mars Land Certificate System',
  publisher: 'Mars Land Certificate System',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://marsland.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mars Land Certificate System',
    description: 'Own your piece of the Red Planet with verified Mars land certificates',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Mars Land Certificate System',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mars Land Certificate System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mars Land Certificate System',
    description: 'Own your piece of the Red Planet with verified Mars land certificates',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'capture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900`}>
        <PayPalScriptProvider options={paypalOptions}>
          <AuthProvider>
            <div className="relative min-h-screen">
              {/* Background Effects */}
              <div className="fixed inset-0 bg-[url('/mars-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none" />
              <div className="fixed inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/10 to-yellow-900/20 pointer-events-none" />
              
              {/* Main Content */}
              <div className="relative z-10">
                {children}
              </div>
              
              {/* Toast Notifications */}
              <Toaster />
            </div>
          </AuthProvider>
        </PayPalScriptProvider>
      </body>
    </html>
  )
}

