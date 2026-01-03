import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactMessage {
  name: string
  email: string
  organization?: string
  subject: string
  message: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, organization, subject, message }: ContactMessage = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Save message to database
    const { data: savedMessage, error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          organization,
          subject,
          message,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to save message: ${dbError.message}`)
    }

    // Send email notification (using SendGrid, Resend, or SMTP)
    const emailSent = await sendEmailNotification({
      name,
      email,
      organization,
      subject,
      message
    })

    // Send auto-reply confirmation to customer
    const autoReplySent = await sendAutoReply({
      name,
      email,
      subject
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message received and saved',
        emailSent,
        autoReplySent,
        id: savedMessage.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function sendEmailNotification(data: ContactMessage): Promise<boolean> {
  try {
    // Option 1: Using Resend (recommended - easy setup)
    const resendKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AIinside Contact <noreply@ainside.me>',
          to: ['inquiries@ainside.me'],
          subject: `Contact Form: ${data.subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${data.name} (${data.email})</p>
            ${data.organization ? `<p><strong>Organization:</strong> ${data.organization}</p>` : ''}
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
          `
        })
      })

      if (!response.ok) {
        console.error('Resend error:', await response.text())
        return false
      }

      return true
    }

    // Option 2: Using SendGrid
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (sendgridKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'inquiries@ainside.me' }],
            subject: `Contact Form: ${data.subject}`
          }],
          from: { email: 'noreply@ainside.me', name: 'AIinside Contact' },
          content: [{
            type: 'text/html',
            value: `
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${data.name} (${data.email})</p>
              ${data.organization ? `<p><strong>Organization:</strong> ${data.organization}</p>` : ''}
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${data.message.replace(/\n/g, '<br>')}</p>
            `
          }]
        })
      })

      if (!response.ok) {
        console.error('SendGrid error:', await response.text())
        return false
      }

      return true
    }

    console.warn('No email service configured (RESEND_API_KEY or SENDGRID_API_KEY)')
    return false

  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

async function sendAutoReply(data: { name: string; email: string; subject: string }): Promise<boolean> {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY')

    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Confirmation - AIinside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: -0.5px;">
                AI<span style="font-weight: 600;">inside</span>
              </h1>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
                Algorithmic Trading Solutions
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 400;">
                Thank You for Contacting Us
              </h2>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Dear ${data.name},
              </p>

              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                We have successfully received your message regarding: <strong style="color: #1e293b;">"${data.subject}"</strong>
              </p>

              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
                  <strong style="display: block; margin-bottom: 8px; color: #1e293b;">What happens next?</strong>
                  Our expert team will review your inquiry and respond within 24-48 hours. For urgent matters, you can also reach us directly at inquiries@ainside.me
                </p>
              </div>

              <p style="margin: 0 0 10px; color: #475569; font-size: 16px; line-height: 1.6;">
                Best regards,
              </p>
              <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 500;">
                The AIinside Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 15px; color: #64748b; font-size: 14px;">
                      <strong style="color: #334155;">AIinside.me</strong> - Professional Algorithmic Trading Tools
                    </p>
                    <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px;">
                      Compatible with TradeStation & MultiCharts
                    </p>
                    <div style="margin: 20px 0;">
                      <a href="https://ainside.me" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Visit Our Platform
                      </a>
                    </div>
                    <p style="margin: 15px 0 0; color: #94a3b8; font-size: 11px;">
                      © ${new Date().getFullYear()} AIinside. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Disclaimer and Unsubscribe -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 12px; color: #64748b; font-size: 11px; line-height: 1.6;">
                      <strong>Disclaimer:</strong> This email is an automated confirmation for your inquiry submitted through our contact form. 
                      Trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. 
                      Please read our full risk disclosure on our website.
                    </p>
                    <p style="margin: 0 0 12px; color: #64748b; font-size: 11px; line-height: 1.6;">
                      You are receiving this email because you contacted us through <a href="https://ainside.me" style="color: #3b82f6; text-decoration: none;">ainside.me</a>. 
                      This is a one-time confirmation message and you will only receive additional emails if our team responds to your inquiry.
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 10px;">
                      If you did not submit this inquiry or wish to stop receiving emails, please contact us at 
                      <a href="mailto:inquiries@ainside.me" style="color: #3b82f6; text-decoration: none;">inquiries@ainside.me</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Try Resend first
    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AIinside <noreply@ainside.me>',
          to: [data.email],
          subject: `Message Received - AIinside Support`,
          html: emailHTML
        })
      })

      if (!response.ok) {
        console.error('Resend auto-reply error:', await response.text())
        return false
      }

      return true
    }

    // Try SendGrid
    if (sendgridKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.email }],
            subject: 'Message Received - AIinside Support'
          }],
          from: { email: 'noreply@ainside.me', name: 'AIinside' },
          content: [{
            type: 'text/html',
            value: emailHTML
          }]
        })
      })

      if (!response.ok) {
        console.error('SendGrid auto-reply error:', await response.text())
        return false
      }

      return true
    }

    console.warn('No email service configured for auto-reply')
    return false

  } catch (error) {
    console.error('Auto-reply sending error:', error)
    return false
  }
}
