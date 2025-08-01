import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  template: string
  data: any
  certificate_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, template, data, certificate_id }: EmailRequest = await req.json()

    // Email templates
    const templates = {
      certificate_issued: {
        subject: 'Your Mars Land Certificate is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Mars Land Certificate System</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2 style="color: #dc2626;">Congratulations, ${data.owner_name}!</h2>
              <p>Your Mars land ownership certificate has been issued successfully.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Certificate Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Certificate ID:</strong> ${data.certificate_id}</li>
                  <li><strong>Land Coordinates:</strong> ${data.land_coordinates}</li>
                  <li><strong>Land Size:</strong> ${data.land_size}</li>
                  <li><strong>Land Value:</strong> $${data.land_value} USD</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verification_url}" 
                   style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Certificate
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                You can verify this certificate anytime using the verification hash: <code>${data.verification_hash}</code>
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <div style="text-align: center; color: #6b7280; font-size: 12px;">
                <p>Mars Land Certificate System</p>
                <p>PayPal: tanloifmc@yahoo.com</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        `
      },
      certificate_approved: {
        subject: 'Your Mars Land Certificate Request Approved',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Mars Land Certificate System</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2 style="color: #059669;">Great News, ${data.owner_name}!</h2>
              <p>Your Mars land certificate request has been approved by our admin team.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Next Steps:</h3>
                <ol>
                  <li>Your certificate is being processed</li>
                  <li>You will receive the final certificate via email within 24 hours</li>
                  <li>The certificate will include a QR code for verification</li>
                </ol>
              </div>
              
              <p style="color: #6b7280;">
                Certificate ID: <strong>${data.certificate_id}</strong>
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <div style="text-align: center; color: #6b7280; font-size: 12px;">
                <p>Mars Land Certificate System</p>
                <p>PayPal: tanloifmc@yahoo.com</p>
              </div>
            </div>
          </div>
        `
      },
      admin_new_request: {
        subject: 'New Mars Land Certificate Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Mars Land Certificate System</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2 style="color: #dc2626;">New Certificate Request</h2>
              <p>A new Mars land certificate request requires your review.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Request Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Certificate ID:</strong> ${data.certificate_id}</li>
                  <li><strong>Requester:</strong> ${data.owner_name} (${data.owner_email})</li>
                  <li><strong>Land Coordinates:</strong> ${data.land_coordinates}</li>
                  <li><strong>Request Date:</strong> ${new Date(data.request_date).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.admin_url}" 
                   style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review Request
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <div style="text-align: center; color: #6b7280; font-size: 12px;">
                <p>Mars Land Certificate System - Admin Panel</p>
              </div>
            </div>
          </div>
        `
      }
    }

    const emailTemplate = templates[template as keyof typeof templates]
    if (!emailTemplate) {
      throw new Error('Invalid email template')
    }

    // In production, integrate with Resend API
    const emailData = {
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    }

    // Log email notification
    await supabaseClient
      .from('email_notifications')
      .insert({
        recipient_email: to,
        subject: emailTemplate.subject,
        template_name: template,
        certificate_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    // Mock successful email send
    console.log('Email would be sent:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        template: template
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

