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
    const { land_id, amount, currency = 'USD', description } = await request.json()

    if (!land_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: land_id, amount' },
        { status: 400 }
      )
    }

    // Verify land exists and is available
    const supabase = createClient()
    const { data: land, error: landError } = await supabase
      .from('lands')
      .select('*')
      .eq('id', land_id)
      .eq('is_owned', false)
      .single()

    if (landError || !land) {
      return NextResponse.json(
        { error: 'Land not found or already owned' },
        { status: 404 }
      )
    }

    // Verify price matches
    if (parseFloat(amount) !== land.price) {
      return NextResponse.json(
        { error: 'Price mismatch' },
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
          reference_id: land_id,
          description: description || `Mars Land Plot ${land.land_id}`,
          amount: {
            currency_code: currency,
            value: amount,
          },
          payee: {
            email_address: 'tanloifmc@yahoo.com',
          },
        },
      ],
      application_context: {
        brand_name: 'Mars Land',
        landing_page: 'NO_PREFERENCE',
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

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal order creation failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      )
    }

    const order = await response.json()

    return NextResponse.json({
      orderID: order.id,
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

