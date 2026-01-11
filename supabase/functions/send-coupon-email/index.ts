import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

interface CouponEmailData {
  recipientEmail: string
  recipientName: string
  couponCode: string
  discountPercent: number
  durationMonths: number
  expiresAt: string | null
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      couponCode, 
      discountPercent, 
      durationMonths,
      expiresAt 
    }: CouponEmailData = await req.json()

    console.log('Received request to send coupon email:', {
      recipientEmail,
      recipientName,
      couponCode,
      discountPercent,
      durationMonths
    })

    // Validate required fields
    if (!recipientEmail || !recipientName || !couponCode || !discountPercent || !durationMonths) {
      console.error('Missing required fields:', {
        hasEmail: !!recipientEmail,
        hasName: !!recipientName,
        hasCode: !!couponCode,
        hasDiscount: !!discountPercent,
        hasDuration: !!durationMonths
      })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send coupon email
    const emailSent = await sendCouponEmail({
      recipientEmail,
      recipientName,
      couponCode,
      discountPercent,
      durationMonths,
      expiresAt
    })

    if (!emailSent) {
      console.error('Email sending failed')
      throw new Error('Failed to send email')
    }

    console.log('Email sent successfully to:', recipientEmail)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Coupon email sent successfully'
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

async function sendCouponEmail(data: CouponEmailData): Promise<boolean> {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY')

    console.log('Email service configuration:', {
      hasResend: !!resendKey,
      hasSendGrid: !!sendgridKey
    })

    const expirationText = data.expiresAt 
      ? `<p><strong>⏰ Válido hasta:</strong> ${new Date(data.expiresAt).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>`
      : ''

    const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Cupón de Descuento - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1e293b; border-radius: 12px;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff;">
                🎉 ¡Tu Cupón de Descuento!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Hola <strong style="color: #ffffff;">${data.recipientName}</strong>,
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Te enviamos un cupón especial de descuento para los planes de trading automático de <strong style="color: #3b82f6;">AInside</strong>.
              </p>

              <!-- Coupon Code Box -->
              <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 15px; font-size: 14px; color: #dbeafe; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Tu Código de Cupón
                </p>
                <div style="background-color: rgba(255, 255, 255, 0.1); border: 2px dashed rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 20px; margin: 0 0 20px;">
                  <code style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                    ${data.couponCode}
                  </code>
                </div>
                <p style="margin: 0; font-size: 14px; color: #dbeafe;">
                  Copia este código y úsalo al momento de realizar tu compra
                </p>
              </div>

              <!-- Benefits -->
              <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <p style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #ffffff;">
                  💎 Beneficios de tu cupón:
                </p>
                <p style="margin: 0 0 10px; font-size: 15px; color: #10b981;">
                  <strong>✓ ${data.discountPercent}% de descuento</strong> durante ${data.durationMonths} meses
                </p>
                <p style="margin: 0 0 10px; font-size: 15px; color: #10b981;">
                  <strong>✓ Uso único</strong> y exclusivo para ti
                </p>
                <p style="margin: 0; font-size: 15px; color: #10b981;">
                  <strong>✓ Aplicable</strong> a todos los planes disponibles
                </p>
              </div>

              ${expirationText}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0 30px;">
                <a href="https://ainside.me/pricing" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                  Ver Planes y Usar Cupón
                </a>
              </div>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">
                Si tienes alguna pregunta, no dudes en contactarnos en 
                <a href="mailto:support@ainside.me" style="color: #3b82f6; text-decoration: none;">support@ainside.me</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #ffffff;">
                AInside Trading
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Trading automático inteligente con IA
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #64748b;">
                <a href="https://ainside.me" style="color: #3b82f6; text-decoration: none;">ainside.me</a>
              </p>
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
          from: 'AInside <noreply@ainside.me>',
          to: [data.recipientEmail],
          subject: `🎁 Tu Cupón de Descuento ${data.discountPercent}% - AInside`,
          html: emailHTML
        })
      })

      if (!response.ok) {
        console.error('Resend error:', await response.text())
        return false
      }

      console.log('Coupon email sent via Resend to:', data.recipientEmail)
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
            to: [{ email: data.recipientEmail, name: data.recipientName }],
            subject: `🎁 Tu Cupón de Descuento ${data.discountPercent}% - AInside`
          }],
          from: { email: 'noreply@ainside.me', name: 'AInside' },
          content: [{
            type: 'text/html',
            value: emailHTML
          }]
        })
      })

      if (!response.ok) {
        console.error('SendGrid error:', await response.text())
        return false
      }

      console.log('Coupon email sent via SendGrid to:', data.recipientEmail)
      return true
    }

    console.error('No email service configured (RESEND_API_KEY or SENDGRID_API_KEY)')
    return false

  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}
