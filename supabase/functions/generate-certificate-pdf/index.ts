import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CertificateData {
  certificate_id: string
  owner_name: string
  owner_email: string
  land_coordinates: string
  land_size: string
  land_value: number
  verification_hash: string
  issue_date: string
  language?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { certificate_id, language = 'en' } = await req.json()

    // Get certificate data
    const { data: certificate, error } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('certificate_id', certificate_id)
      .single()

    if (error || !certificate) {
      return new Response(
        JSON.stringify({ error: 'Certificate not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate PDF content (simplified version - in production use proper PDF library)
    const pdfContent = generatePDFContent(certificate, language)
    
    // In a real implementation, you would:
    // 1. Use a proper PDF generation library like jsPDF or Puppeteer
    // 2. Generate QR code
    // 3. Upload to Supabase Storage
    // 4. Return the storage URL

    // For now, return a mock response
    const mockPdfUrl = `https://your-supabase-project.supabase.co/storage/v1/object/public/certificates/${certificate_id}_${language}.pdf`

    // Update certificate with PDF URL
    await supabaseClient
      .from('certificates')
      .update({ 
        pdf_final_url: mockPdfUrl,
        issued_date: new Date().toISOString()
      })
      .eq('id', certificate.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: mockPdfUrl,
        certificate_id: certificate_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generatePDFContent(certificate: any, language: string): string {
  const translations = {
    en: {
      title: 'Mars Land Ownership Certificate',
      owner: 'Owner',
      coordinates: 'Coordinates',
      size: 'Land Size',
      value: 'Land Value',
      issued: 'Issued Date',
      verification: 'Verification Hash'
    },
    vi: {
      title: 'Giấy Chứng Nhận Sở Hữu Đất Sao Hỏa',
      owner: 'Chủ Sở Hữu',
      coordinates: 'Tọa Độ',
      size: 'Diện Tích',
      value: 'Giá Trị',
      issued: 'Ngày Cấp',
      verification: 'Mã Xác Thực'
    }
  }

  const t = translations[language as keyof typeof translations] || translations.en

  return `
    ${t.title}
    
    Certificate ID: ${certificate.certificate_id}
    ${t.owner}: ${certificate.owner_name}
    ${t.coordinates}: ${certificate.land_coordinates}
    ${t.size}: ${certificate.land_size}
    ${t.value}: $${certificate.land_value} USD
    ${t.issued}: ${new Date(certificate.issued_date || Date.now()).toLocaleDateString()}
    ${t.verification}: ${certificate.verification_hash}
    
    PayPal: tanloifmc@yahoo.com
  `
}

