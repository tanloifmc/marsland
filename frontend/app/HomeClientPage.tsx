// /app/HomeClientPage.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // <-- THÊM DÒNG NÀY
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

export default function HomeClientPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const router = useRouter() // <-- THÊM DÒNG NÀY

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    window.location.href = '/dashboard'
  }

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* SỬA LẠI DÒNG DƯỚI ĐÂY */}
      <HeroSection 
        onGetStarted={() => openAuthModal('signup')} 
        onVerify={() => router.push('/verify')} 
        isLoggedIn={false} 
      />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <Footer />

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={(newMode) => setAuthMode(newMode)}
        />
      )}
    </main>
  )
}
