'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Globe, Users, Shield, Star, MapPin } from 'lucide-react'
import Mars3DViewer from '@/components/Mars3DViewer'
import { createClient } from '@/lib/supabase'
import { LandPlot } from "@/types/land"



export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedLand, setSelectedLand] = useState<LandPlot | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [showMarsViewer, setShowMarsViewer] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') {
        setShowAuthModal(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLandSelect = (land: LandPlot) => {
    setSelectedLand(land)
  }

  const handleAuth = async (email: string, password: string) => {
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Rocket className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Mars Land
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, {user.email}</span>
                <button
                  onClick={() => setShowMarsViewer(!showMarsViewer)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {showMarsViewer ? 'Hide Mars' : 'Explore Mars'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {!showMarsViewer && (
        <section className="pt-24 pb-12 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  Own Mars
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Purchase virtual land on Mars, build your dream colony, and join the first interplanetary community. 
                Experience the future of space exploration today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => user ? setShowMarsViewer(true) : setShowAuthModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
                >
                  <Globe className="inline mr-2" />
                  Explore Mars
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
                >
                  <Users className="inline mr-2" />
                  Join Community
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">1M+</div>
                  <div className="text-gray-400">Land Plots</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">50K+</div>
                  <div className="text-gray-400">Colonists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">25K+</div>
                  <div className="text-gray-400">Buildings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">$2.5M+</div>
                  <div className="text-gray-400">Total Value</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Mars 3D Viewer */}
      {showMarsViewer && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-20 h-screen"
        >
          <Mars3DViewer
            onLandSelect={handleLandSelect}
            selectedLandId={selectedLand?.id}
            showGrid={true}
          />
        </motion.section>
      )}

      {/* Features Section */}
      {!showMarsViewer && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Mars Land Features
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Experience the most advanced virtual Mars colonization platform
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "3D Mars Explorer",
                  description: "Navigate a realistic 3D Mars planet with 360° rotation and zoom capabilities"
                },
                {
                  icon: MapPin,
                  title: "Land Ownership",
                  description: "Purchase and own virtual land plots with blockchain-verified certificates"
                },
                {
                  icon: Users,
                  title: "Social Community",
                  description: "Connect with neighbors, chat, and build communities on Mars"
                },
                {
                  icon: Shield,
                  title: "Secure Transactions",
                  description: "PayPal integration with secure payment processing and instant certificates"
                },
                {
                  icon: Star,
                  title: "Building System",
                  description: "Design and build your Mars colony with our advanced 20x20 grid system"
                },
                {
                  icon: Rocket,
                  title: "NFT Ready",
                  description: "All land certificates are NFT-ready for blockchain integration"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all"
                >
                  <feature.icon className="h-12 w-12 text-orange-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      {!showMarsViewer && (
        <section className="py-20 px-4 bg-gradient-to-r from-gray-900/50 to-black/50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                How It Works
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Explore Mars", description: "Navigate the 3D Mars planet and find your perfect land plot" },
                { step: "2", title: "Select Land", description: "Choose from 1 million available land plots with unique coordinates" },
                { step: "3", title: "Secure Purchase", description: "Complete payment via PayPal with instant certificate generation" },
                { step: "4", title: "Build & Connect", description: "Start building your colony and connect with the Mars community" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-orange-500/20"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              {authMode === 'login' ? 'Welcome Back' : 'Join Mars Land'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const email = formData.get('email') as string
              const password = formData.get('password') as string
              handleAuth(email, password)
            }}>
              <div className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      {!showMarsViewer && (
        <footer className="py-12 px-4 border-t border-orange-500/20">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Rocket className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Mars Land
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              The future of interplanetary real estate
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Mars Land. All rights reserved. | PayPal: tanloifmc@yahoo.com
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

