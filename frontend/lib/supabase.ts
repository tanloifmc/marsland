import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Client-side Supabase client
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Service role client (for admin operations)
export const createServiceClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Utility functions
export const getUser = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getProfile = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { profile: data, error }
}

export const isAdmin = async (userId: string) => {
  const { profile } = await getProfile(userId)
  return profile?.role === 'admin'
}

// Certificate utilities
export const getCertificate = async (certificateId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_id', certificateId)
    .single()
  
  return { certificate: data, error }
}

export const verifyCertificate = async (verificationHash: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('verification_hash', verificationHash)
    .eq('status', 'issued')
    .single()
  
  return { certificate: data, error }
}

export const getUserCertificates = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  
  return { certificates: data, error }
}

// Admin utilities
export const getPendingCertificates = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  
  return { certificates: data, error }
}

export const getAllCertificates = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { certificates: data, error }
}

export const approveCertificate = async (certificateId: string, adminId: string, notes?: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .update({
      status: 'approved',
      approved_date: new Date().toISOString(),
      approved_by: adminId,
      admin_notes: notes,
    })
    .eq('id', certificateId)
    .select()
    .single()
  
  return { certificate: data, error }
}

export const rejectCertificate = async (certificateId: string, adminId: string, reason: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .update({
      status: 'rejected',
      approved_by: adminId,
      rejection_reason: reason,
    })
    .eq('id', certificateId)
    .select()
    .single()
  
  return { certificate: data, error }
}

// Payment utilities
export const getPaymentTransactions = async (userId?: string) => {
  const supabase = createClient()
  let query = supabase
    .from('payment_transactions')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  return { transactions: data, error }
}

// System settings
export const getSystemSetting = async (key: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  return { value: data?.value, error }
}

export const updateSystemSetting = async (key: string, value: any, userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key,
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  return { setting: data, error }
}

