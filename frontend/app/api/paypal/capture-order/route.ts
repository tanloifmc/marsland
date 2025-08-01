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

export async function POST(request: NextRequest) {
  try {
    const { order_id, certificate_id } = await request.json()

    if (!order_id || !certificate_id) {
      return NextResponse.json(
        { error: 'Order ID and Certificate ID are required' },
        { status: 400 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Capture the PayPal order
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await response.json()

    if (!response.ok) {
      console.error('PayPal capture failed:', captureData)
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment', details: captureData },
        { status: 500 }
      )
    }

    // Verify payment was successful
    const paymentStatus = captureData.status
    const captureDetails = captureData.purchase_units?.[0]?.payments?.captures?.[0]

    if (paymentStatus !== 'COMPLETED' || !captureDetails) {
      return NextResponse.json(
        { error: 'Payment was not completed successfully' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update payment transaction status
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        payment_data: {
          paypal_order_id: order_id,
          capture_details: captureDetails,
          completed_at: new Date().toISOString(),
        },
      })
      .eq('payment_id', order_id)

    if (updateError) {
      console.error('Error updating payment transaction:', updateError)
    }

    // Update certificate status to 'issued' and set issued_date
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .update({
        status: 'issued',
        issued_date: new Date().toISOString(),
      })
      .eq('certificate_id', certificate_id)
      .select()
      .single()

    if (certError) {
      console.error('Error updating certificate:', certError)
      return NextResponse.json(
        { error: 'Payment successful but failed to update certificate' },
        { status: 500 }
      )
    }

    // Trigger PDF generation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-certificate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificate_id: certificate_id,
          language: 'en',
        }),
      })
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError)
      // Don't fail the payment for PDF generation errors
    }

    // Send email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: certificate.owner_email,
          template: 'certificate_issued',
          certificate_id: certificate_id,
          data: {
            owner_name: certificate.owner_name,
            certificate_id: certificate_id,
            land_coordinates: certificate.land_coordinates,
            land_size: certificate.land_size,
            land_value: certificate.land_value,
            verification_hash: certificate.verification_hash,
            verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify?hash=${certificate.verification_hash}`,
          },
        }),
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the payment for email errors
    }

    return NextResponse.json({
      success: true,
      order_id: order_id,
      certificate_id: certificate_id,
      capture_details: captureDetails,
      payment_status: paymentStatus,
      certificate_status: 'issued',
    })

  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

