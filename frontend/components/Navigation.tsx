// /components/Navigation.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Shield, User as UserIcon, LogOut } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types/database'

interface NavigationProps {
  user: User | null
  profile: Profile | null
}

export default function Navigation({ user, profile }: NavigationProps) {
  const { signOut } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Mars Land
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Dashboard</Button>
                </Link>
                <Link href="/community">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Community</Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Messages</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Profile</Button>
                </Link>
                <Link href="/verify">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Verify</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Admin</Button>
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-white">{profile?.full_name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-red-400 hover:text-red-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
