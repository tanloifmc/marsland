// /components/providers/AuthProvider.tsx
'use client'

import React, { createContext, useContext, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())

  const signOut = async () => {
    await supabase.auth.signOut()
    // Reload the page to reflect the signed-out state from the server
    window.location.reload()
  }

  const value = { signOut }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
