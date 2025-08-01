'use client'

import React from 'react'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  onGetStarted: () => void
  onVerify: () => void
  isLoggedIn: boolean
}

export default function HeroSection({ onGetStarted, onVerify, isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4 mr-2" />
            Now with NFT Integration & Blockchain Verification
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 animate-fade-in">
            <span className="block text-white mb-2">Own Your Piece of</span>
            <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              The Red Planet
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Secure your Mars land ownership with blockchain-verified certificates, 
            QR code authentication, and NFT-ready technology. Join thousands of space pioneers today.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">1M+</div>
              <div className="text-gray-400 text-sm">Land Parcels Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">50K+</div>
              <div className="text-gray-400 text-sm">Verified Owners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">25K+</div>
              <div className="text-gray-400 text-sm">Certificates Issued</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Your Certificate'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={onVerify}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-2" />
              Verify Certificate
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in">
            <div className="glass-effect rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Blockchain Verified</h3>
              <p className="text-gray-400 text-sm">
                Every certificate is secured with blockchain technology and QR code verification
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Global Recognition</h3>
              <p className="text-gray-400 text-sm">
                Internationally recognized certificates with multi-language support
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">NFT Ready</h3>
              <p className="text-gray-400 text-sm">
                Future-proof certificates ready for NFT minting and blockchain trading
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-800 animate-fade-in">
            <p className="text-gray-400 text-sm mb-4">Trusted by space enthusiasts worldwide</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-gray-500 font-semibold">PayPal Verified</div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="text-gray-500 font-semibold">SSL Secured</div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="text-gray-500 font-semibold">ISO Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-600 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

