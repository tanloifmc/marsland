'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { 
  Menu, 
  X, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Settings,
  FileText,
  Globe,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Profile } from '@/types/database'

interface NavigationProps {
  user: User | null
  profile: Profile | null
  onLogin: () => void
  onGetStarted: () => void
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export default function Navigation({ user, profile, onLogin, onGetStarted }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    // In a real app, you would implement i18n here
    console.log('Language changed to:', languageCode)
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/verify', label: 'Verify Certificate', active: pathname === '/verify' },
    { href: '/about', label: 'About', active: pathname === '/about' },
    { href: '/contact', label: 'Contact', active: pathname === '/contact' },
  ]

  const userNavItems = user ? [
    { href: '/dashboard', label: 'Dashboard', active: pathname === '/dashboard' },
    { href: '/certificates', label: 'My Certificates', active: pathname === '/certificates' },
    ...(profile?.role === 'admin' ? [
      { href: '/admin', label: 'Admin Panel', active: pathname === '/admin' }
    ] : []),
  ] : []

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Mars Land
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-red-400 ${
                  item.active ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {userNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-red-400 ${
                  item.active ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  {currentLang.flag} {currentLang.code.toUpperCase()}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <UserIcon className="w-4 h-4 mr-2" />
                    {profile?.full_name || user.email}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/certificates" className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <FileText className="w-4 h-4 mr-2" />
                      My Certificates
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="text-gray-300 hover:text-white hover:bg-gray-800">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogin}
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md rounded-lg mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-red-400 ${
                    item.active ? 'text-red-400' : 'text-gray-300'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-red-400 ${
                    item.active ? 'text-red-400' : 'text-gray-300'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-gray-700 pt-3 mt-3">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Signed in as {profile?.full_name || user.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onLogin()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start text-gray-300 hover:text-white"
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onGetStarted()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

