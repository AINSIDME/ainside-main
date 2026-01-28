import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  created_at: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: ContactMessage;
  schema: string;
  old_record: null | ContactMessage;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    
    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const message = payload.record;
    
    // Send email notification to admin
    const emailSent = await sendAdminNotification(message);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Admin notification sent',
        emailSent
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendAdminNotification(data: ContactMessage): Promise<boolean> {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }

    const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Mensaje de Contacto - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f172a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 700px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px 40px; border-radius: 16px 16px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: left;">
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; margin-bottom: 12px;">
                      <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        🔔 NUEVO MENSAJE
                      </span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">
                      Formulario de Contacto
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
                      ${new Date(data.created_at).toLocaleString('es-ES', { 
                        dateStyle: 'full', 
                        timeStyle: 'short' 
                      })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Contact Info Card -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 16px; border-bottom: 1px solid #334155;">
                      <p style="margin: 0 0 4px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Nombre Completo
                      </p>
                      <p style="margin: 0; color: #f1f5f9; font-size: 18px; font-weight: 600;">
                        ${data.name}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 16px; padding-bottom: 16px; border-bottom: 1px solid #334155;">
                      <p style="margin: 0 0 4px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Email de Contacto
                      </p>
                      <p style="margin: 0;">
                        <a href="mailto:${data.email}" style="color: #3b82f6; font-size: 16px; font-weight: 500; text-decoration: none;">
                          ${data.email}
                        </a>
                      </p>
                    </td>
                  </tr>
                  ${data.organization ? `
                  <tr>
                    <td style="padding-top: 16px; padding-bottom: 16px; border-bottom: 1px solid #334155;">
                      <p style="margin: 0 0 4px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Organización
                      </p>
                      <p style="margin: 0; color: #f1f5f9; font-size: 16px; font-weight: 500;">
                        ${data.organization}
                      </p>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding-top: 16px;">
                      <p style="margin: 0 0 4px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Asunto
                      </p>
                      <p style="margin: 0; color: #f1f5f9; font-size: 16px; font-weight: 600;">
                        ${data.subject}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Message Card -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Mensaje
                </p>
                <div style="color: #cbd5e1; font-size: 15px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word;">
${data.message}
                </div>
              </div>

              <!-- Action Buttons -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 10px 5px;">
                    <a href="mailto:${data.email}?subject=Re:%20${encodeURIComponent(data.subject)}" 
                       style="display: block; width: 100%; padding: 16px 24px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-align: center; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                      📧 Responder por Email
                    </a>
                  </td>
                  <td style="padding: 10px 5px;">
                    <a href="https://ainside.me/admin/messages" 
                       style="display: block; width: 100%; padding: 16px 24px; background-color: #334155; color: #ffffff; text-align: center; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; border: 1px solid #475569;">
                      🗂️ Ver en Panel Admin
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #334155;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
                <strong style="color: #94a3b8;">AInside Admin Panel</strong><br/>
                Notificación automática de nuevo mensaje de contacto<br/>
                <a href="https://ainside.me/admin/messages" style="color: #3b82f6; text-decoration: none;">Gestionar Mensajes</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AInside Notifications <notifications@ainside.me>',
        to: ['jonathangolubok@gmail.com'],
        reply_to: [data.email],
        subject: `🔔 Nuevo Mensaje de Contacto: ${data.subject}`,
        html: emailHTML
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend error:', errorText);
      return false;
    }

    console.log('Admin notification sent successfully');
    return true;

  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}
