'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'
import { useToast } from '@/hooks/use-toast'

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleVerify = () => {
    router.push('/verify')
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    toast({
      title: 'Welcome to Mars Land!',
      description: 'Your account has been created successfully.',
    })
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        user={user}
        profile={profile}
        onLogin={handleLogin}
        onGetStarted={handleGetStarted}
      />
      
      <main>
        <HeroSection 
          onGetStarted={handleGetStarted}
          onVerify={handleVerify}
          isLoggedIn={!!user}
        />
        
        <FeaturesSection />
        
        <HowItWorksSection />
        
        <StatsSection />
        
        <TestimonialsSection />
      </main>
      
      <Footer />
      
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
	  mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  )
}

