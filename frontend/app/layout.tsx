// /app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import AppProviders from '@/components/AppProviders'
import Navigation from '@/components/Navigation'
import { createClient } from '@/lib/supabase/server' // <-- SỬ DỤNG SERVER CLIENT

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mars Land Certificate System',
  description: 'Own your piece of the Red Planet with verified Mars land certificates',
}

// Đã chuyển sang AppProviders

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900`}>
        <AppProviders>
          <div className="relative min-h-screen">
            <Navigation user={user} profile={profile} />
            <div className="relative z-10">
              {children}
            </div>
            <Toaster />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
