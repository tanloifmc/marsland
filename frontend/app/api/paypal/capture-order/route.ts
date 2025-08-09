import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

async function generateCertificateId() {
  const supabase = createClient()
  
  // Get the latest certificate number
  const { data: lastCert } = await supabase
    .from('certificates')
    .select('certificate_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let nextNumber = 1
  if (lastCert?.certificate_id) {
    const match = lastCert.certificate_id.match(/CERT-MARS-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1]) + 1
    }
  }

  return `CERT-MARS-${nextNumber.toString().padStart(6, '0')}`
}

async function generateVerificationHash(certificateId: string, landId: string) {
  const data = `${certificateId}-${landId}-${Date.now()}`
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, land_id } = await request.json()

    if (!orderID || !land_id) {
      return NextResponse.json(
        { error: 'Missing required fields: orderID, land_id' },
        { status: 400 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Capture the PayPal payment
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal capture failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment' },
        { status: 500 }
      )
    }

    const captureData = await response.json()
    
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get user from auth
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Update land ownership
    const { data: land, error: landUpdateError } = await supabase
      .from('lands')
      .update({
        is_owned: true,
        owner_id: user.id,
        purchased_at: new Date().toISOString(),
      })
      .eq('id', land_id)
      .eq('is_owned', false) // Ensure it's still available
      .select()
      .single()

    if (landUpdateError || !land) {
      console.error('Failed to update land ownership:', landUpdateError)
      return NextResponse.json(
        { error: 'Failed to update land ownership' },
        { status: 500 }
      )
    }

    // Generate certificate
    const certificateId = await generateCertificateId()
    const verificationHash = await generateVerificationHash(certificateId, land_id)
    
    const paymentAmount = captureData.purchase_units[0].payments.captures[0].amount.value
    const paymentCurrency = captureData.purchase_units[0].payments.captures[0].amount.currency_code

    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        certificate_id: certificateId,
        land_id: land.id,
        owner_id: user.id,
        status: 'issued',
        payment_id: orderID,
        payment_status: 'completed',
        payment_amount: parseFloat(paymentAmount),
        payment_currency: paymentCurrency,
        verification_hash: verificationHash,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (certError) {
      console.error('Failed to create certificate:', certError)
      return NextResponse.json(
        { error: 'Failed to create certificate' },
        { status: 500 }
      )
    }

    // TODO: Generate PDF certificate and QR code
    // TODO: Send email notification

    return NextResponse.json({
      status: 'COMPLETED',
      paymentID: orderID,
      certificateId: certificateId,
      verificationHash: verificationHash,
      land: land,
      certificate: certificate,
    })

  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

