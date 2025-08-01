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
    const { certificate_id, amount, currency = 'USD' } = await request.json()

    if (!certificate_id || !amount) {
      return NextResponse.json(
        { error: 'Certificate ID and amount are required' },
        { status: 400 }
      )
    }

    // Verify certificate exists and is in correct status
    const supabase = createClient()
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_id', certificate_id)
      .single()

    if (certError || !certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    if (certificate.status !== 'approved') {
      return NextResponse.json(
        { error: 'Certificate must be approved before payment' },
        { status: 400 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: certificate_id,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `Mars Land Certificate - ${certificate_id}`,
          custom_id: certificate_id,
          payee: {
            email_address: 'tanloifmc@yahoo.com',
          },
        },
      ],
      application_context: {
        brand_name: 'Mars Land Certificate System',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      },
    }

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error('PayPal order creation failed:', order)
      return NextResponse.json(
        { error: 'Failed to create PayPal order', details: order },
        { status: 500 }
      )
    }

    // Record the order creation in database
    await supabase
      .from('payment_transactions')
      .insert({
        certificate_id: certificate.id,
        user_id: certificate.owner_id,
        payment_method: 'paypal',
        payment_id: order.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        payment_data: {
          paypal_order_id: order.id,
          order_details: order,
        },
      })

    return NextResponse.json({
      order_id: order.id,
      status: order.status,
    })

  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

