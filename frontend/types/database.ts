export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      land_parcels: {
        Row: {
          id: string
          land_id: string
          coordinates: string
          size_sqm: number
          region: string
          price_usd: number
          owner_id: string | null
          purchased_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          land_id: string
          coordinates: string
          size_sqm?: number
          region: string
          price_usd?: number
          owner_id?: string | null
          purchased_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          land_id?: string
          coordinates?: string
          size_sqm?: number
          region?: string
          price_usd?: number
          owner_id?: string | null
          purchased_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_id: string
          land_parcel_id: string | null
          owner_id: string
          template_id: string | null
          owner_name: string
          owner_email: string
          land_coordinates: string
          land_size: string
          land_value: number
          status: 'pending' | 'approved' | 'rejected' | 'issued'
          request_date: string
          approved_date: string | null
          issued_date: string | null
          approved_by: string | null
          verification_hash: string
          qr_code_url: string | null
          pdf_draft_url: string | null
          pdf_final_url: string | null
          nft_token_id: string | null
          nft_contract_address: string | null
          nft_metadata_uri: string | null
          nft_blockchain: string
          admin_notes: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certificate_id: string
          land_parcel_id?: string | null
          owner_id: string
          template_id?: string | null
          owner_name: string
          owner_email: string
          land_coordinates: string
          land_size: string
          land_value: number
          status?: 'pending' | 'approved' | 'rejected' | 'issued'
          request_date?: string
          approved_date?: string | null
          issued_date?: string | null
          approved_by?: string | null
          verification_hash: string
          qr_code_url?: string | null
          pdf_draft_url?: string | null
          pdf_final_url?: string | null
          nft_token_id?: string | null
          nft_contract_address?: string | null
          nft_metadata_uri?: string | null
          nft_blockchain?: string
          admin_notes?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certificate_id?: string
          land_parcel_id?: string | null
          owner_id?: string
          template_id?: string | null
          owner_name?: string
          owner_email?: string
          land_coordinates?: string
          land_size?: string
          land_value?: number
          status?: 'pending' | 'approved' | 'rejected' | 'issued'
          request_date?: string
          approved_date?: string | null
          issued_date?: string | null
          approved_by?: string | null
          verification_hash?: string
          qr_code_url?: string | null
          pdf_draft_url?: string | null
          pdf_final_url?: string | null
          nft_token_id?: string | null
          nft_contract_address?: string | null
          nft_metadata_uri?: string | null
          nft_blockchain?: string
          admin_notes?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      certificate_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          design_config: Json
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          design_config: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          design_config?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          certificate_id: string | null
          user_id: string | null
          payment_method: string
          payment_id: string
          amount: number
          currency: string
          status: string
          payment_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certificate_id?: string | null
          user_id?: string | null
          payment_method: string
          payment_id: string
          amount: number
          currency?: string
          status: string
          payment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certificate_id?: string | null
          user_id?: string | null
          payment_method?: string
          payment_id?: string
          amount?: number
          currency?: string
          status?: string
          payment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      email_notifications: {
        Row: {
          id: string
          recipient_email: string
          subject: string
          template_name: string | null
          certificate_id: string | null
          status: string
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_email: string
          subject: string
          template_name?: string | null
          certificate_id?: string | null
          status?: string
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_email?: string
          subject?: string
          template_name?: string | null
          certificate_id?: string | null
          status?: string
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_certificate_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_land_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      certificate_status: 'pending' | 'approved' | 'rejected' | 'issued'
      user_role: 'user' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Certificate = Database['public']['Tables']['certificates']['Row']
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert']
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type LandParcel = Database['public']['Tables']['land_parcels']['Row']
export type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row']
export type EmailNotification = Database['public']['Tables']['email_notifications']['Row']

export type CertificateStatus = Database['public']['Enums']['certificate_status']
export type UserRole = Database['public']['Enums']['user_role']

